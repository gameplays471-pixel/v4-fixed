-- Adiciona campo "active" ao modelo Workout (feature: treinos inativos/finalizados)
-- Quando active=false, o treino nao aparece na lista principal nem no dashboard,
-- mas todo o historico (sessoes, sets, PRs) permanece intacto.

ALTER TABLE "Workout" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- Indice composto para a query principal: listar treinos do usuario ordenados por status
CREATE INDEX "Workout_userId_active_idx" ON "Workout"("userId", "active");
