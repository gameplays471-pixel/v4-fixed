/**
 * Smoke de contrato do fluxo crítico (login payload → sessão → stats shape).
 * Não sobe servidor: valida schemas Zod usados nas rotas.
 * O script scripts/test-e2e-ci.ts cobre HTTP real quando BASE_URL está setado.
 */
import { describe, it, expect } from "vitest";
import { loginSchema, sessionSchema, workoutSchema } from "../validation";
import { suggestProgressions } from "../progression";

describe("fluxo crítico — contratos Zod", () => {
  it("login aceita aluno demo", () => {
    const r = loginSchema.safeParse({
      email: "aluno1@aluno.com",
      password: "12345678",
    });
    expect(r.success).toBe(true);
  });

  it("criar treino exige nome e exercícios válidos", () => {
    const r = workoutSchema.safeParse({
      name: "Treino A",
      exercises: [
        { exerciseId: "clx123", targetSets: 3, targetReps: 10, restSeconds: 90 },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("finalizar sessão aceita sets com RIR", () => {
    const r = sessionSchema.safeParse({
      workoutName: "Treino A",
      startedAt: new Date().toISOString(),
      durationSec: 3600,
      sets: [
        {
          exerciseId: "clx123",
          exerciseName: "Supino",
          weight: 60,
          reps: 10,
          restSeconds: 90,
          rir: 1,
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("progressão sugere carga após RIR baixo", () => {
    const suggestions = suggestProgressions([
      {
        exerciseId: "1",
        exerciseName: "Supino",
        weight: 60,
        reps: 10,
        rir: 0,
        isPR: false,
      },
    ]);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].suggestedWeight).toBe(62.5);
  });
});
