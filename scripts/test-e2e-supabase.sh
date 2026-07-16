#!/bin/bash
# E2E test on Supabase
set -e
BASE="http://localhost:3000"

echo "=== 1. Login ==="
LOGIN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d '{"email":"demo@hevy.com","password":"demo123"}' --max-time 30)
TOKEN=$(echo "$LOGIN" | python3 -c "import json,sys; print(json.load(sys.stdin).get('token',''))")
echo "  Token: ${TOKEN:0:30}..."

echo ""
echo "=== 2. Exercises count ==="
COUNT=$(curl -s "$BASE/api/exercises" --max-time 30 | python3 -c "import json,sys; print(len(json.load(sys.stdin).get('exercises',[])))")
echo "  $COUNT exercícios"

echo ""
echo "=== 3. List workouts ==="
curl -s "$BASE/api/workouts" -H "Authorization: Bearer $TOKEN" --max-time 30 | python3 -c "
import json,sys
d=json.load(sys.stdin)
for w in d.get('workouts',[]):
    print(f'  - {w[\"name\"]} (id: {w[\"id\"]})')
"

echo ""
echo "=== 4. List sessions (should be 15) ==="
SESS=$(curl -s "$BASE/api/sessions" -H "Authorization: Bearer $TOKEN" --max-time 30 | python3 -c "import json,sys; print(len(json.load(sys.stdin).get('sessions',[])))")
echo "  $SESS sessões"

echo ""
echo "=== 5. Create new workout ==="
NEW=$(curl -s -X POST "$BASE/api/workouts" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Teste Supabase","defaultRest":90,"exercises":[]}' --max-time 30)
NEW_ID=$(echo "$NEW" | python3 -c "import json,sys; print(json.load(sys.stdin).get('workout',{}).get('id',''))")
echo "  Created workout id: $NEW_ID"

echo ""
echo "=== 6. Finalize workout (create session) ==="
# Find the workout that has exercises (Treino A)
WORKOUT_ID=$(curl -s "$BASE/api/workouts" -H "Authorization: Bearer $TOKEN" --max-time 30 | python3 -c "
import json,sys
d=json.load(sys.stdin)
for w in d.get('workouts',[]):
    if len(w.get('exercises',[])) > 0:
        print(w['id'])
        break
")
echo "  Using workout: $WORKOUT_ID"
EX_ID=$(curl -s "$BASE/api/workouts/$WORKOUT_ID" -H "Authorization: Bearer $TOKEN" --max-time 30 | python3 -c "import json,sys; print(json.load(sys.stdin)['workout']['exercises'][0]['exerciseId'])")
echo "  ExerciseId: $EX_ID"
NOW_ISO=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
PAST_ISO=$(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S.000Z)
SESS_RESP=$(curl -s -X POST "$BASE/api/sessions" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"workoutId\":\"$WORKOUT_ID\",\"workoutName\":\"Teste\",\"startedAt\":\"$PAST_ISO\",\"endedAt\":\"$NOW_ISO\",\"durationSec\":300,\"sets\":[{\"exerciseId\":\"$EX_ID\",\"exerciseName\":\"Supino Teste\",\"weight\":80,\"reps\":8,\"restSeconds\":90}]}" --max-time 30)
echo "  Session: $(echo $SESS_RESP | head -c 150)"

echo ""
echo "=== 7. Sessions count after create (should be 16) ==="
SESS_AFTER=$(curl -s "$BASE/api/sessions" -H "Authorization: Bearer $TOKEN" --max-time 30 | python3 -c "import json,sys; print(len(json.load(sys.stdin).get('sessions',[])))")
echo "  $SESS_AFTER sessões"

echo ""
echo "=== 8. Last-sets endpoint ==="
curl -s "$BASE/api/sessions/last-sets?exerciseIds=$EX_ID" -H "Authorization: Bearer $TOKEN" --max-time 30 | python3 -c "
import json,sys
d=json.load(sys.stdin)
ls=d.get('lastSets',{})
for k,v in ls.items():
    print(f'  exerciseId={k}: {len(v)} sets')
    for s in v:
        print(f'    weight={s[\"weight\"]}kg reps={s[\"reps\"]}')
"

echo ""
echo "=== 9. Cleanup: delete test workout ==="
curl -s -X DELETE "$BASE/api/workouts/$NEW_ID" -H "Authorization: Bearer $TOKEN" --max-time 30 | head -c 100
echo ""
echo ""
echo "=== ALL TESTS DONE ==="
