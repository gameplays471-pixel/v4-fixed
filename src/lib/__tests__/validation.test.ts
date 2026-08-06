import { describe, it, expect } from "vitest";
import {
  signupSchema,
  loginSchema,
  workoutSchema,
  sessionSchema,
  parseIntParam,
} from "../validation";

// ─── signupSchema ───────────────────────────────────────────────────

describe("signupSchema", () => {
  const validPayload = {
    email: "user@example.com",
    password: "123456",
  };

  it("aceita payload válido mínimo (email + senha)", () => {
    const result = signupSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
      expect(result.data.password).toBe("123456");
    }
  });

  it("aceita payload com name opcional", () => {
    const result = signupSchema.safeParse({ ...validPayload, name: "João" });
    expect(result.success).toBe(true);
  });

  it("rejeita email inválido", () => {
    const result = signupSchema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("email");
    }
  });

  it("rejeita email vazio", () => {
    const result = signupSchema.safeParse({ ...validPayload, email: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita senha com menos de 6 caracteres", () => {
    const result = signupSchema.safeParse({ ...validPayload, password: "12345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("password");
    }
  });

  it("aceita senha com exatamente 6 caracteres", () => {
    const result = signupSchema.safeParse({ ...validPayload, password: "123456" });
    expect(result.success).toBe(true);
  });

  it("trim de email (espaços nas pontas)", () => {
    const result = signupSchema.safeParse({
      email: "  user@example.com  ",
      password: "123456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejeita payload vazio", () => {
    const result = signupSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─── loginSchema ────────────────────────────────────────────────────

describe("loginSchema", () => {
  it("aceita email + senha", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "abc",
    });
    expect(result.success).toBe(true);
  });

  it("aceita rememberMe opcional", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "abc",
      rememberMe: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita senha vazia", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

// ─── workoutSchema (criação de treino) ─────────────────────────────

describe("workoutSchema", () => {
  const validPayload = {
    name: "Treino A",
    exercises: [
      {
        exerciseId: "ex-1",
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
    ],
  };

  it("aceita treino válido com exercícios", () => {
    const result = workoutSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("aceita treino sem exercícios (exercícios opcional)", () => {
    const result = workoutSchema.safeParse({ name: "Treino B" });
    expect(result.success).toBe(true);
  });

  it("aceita campos opcionais como description e color", () => {
    const result = workoutSchema.safeParse({
      name: "Treino C",
      description: "Treino de push",
      color: "#FF0000",
      defaultRest: 120,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita nome vazio", () => {
    const result = workoutSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("name");
    }
  });

  it("rejeita nome ausente", () => {
    const result = workoutSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejeita targetSets negativo", () => {
    const result = workoutSchema.safeParse({
      name: "Treino D",
      exercises: [{ exerciseId: "ex-1", targetSets: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita targetReps zero", () => {
    const result = workoutSchema.safeParse({
      name: "Treino E",
      exercises: [{ exerciseId: "ex-1", targetReps: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita mais de 200 exercícios", () => {
    const exercises = Array.from({ length: 201 }, (_, i) => ({
      exerciseId: `ex-${i}`,
      targetSets: 3,
    }));
    const result = workoutSchema.safeParse({ name: "Treino F", exercises });
    expect(result.success).toBe(false);
  });

  it("coerce string para número em targetSets", () => {
    // Simula dado vindo de form HTML (tudo string)
    const result = workoutSchema.safeParse({
      name: "Treino G",
      exercises: [{ exerciseId: "ex-1", targetSets: "3", targetReps: "10" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.exercises![0].targetSets).toBe("number");
      expect(result.data.exercises![0].targetSets).toBe(3);
    }
  });
});

// ─── sessionSchema (finalizar treino) ──────────────────────────────

describe("sessionSchema", () => {
  const validPayload = {
    workoutName: "Treino A",
    startedAt: "2025-01-15T10:00:00.000Z",
    endedAt: "2025-01-15T11:00:00.000Z",
    durationSec: 3600,
    sets: [
      {
        exerciseId: "ex-1",
        exerciseName: "Supino Reto",
        weight: 60,
        reps: 10,
        restSeconds: 90,
        rir: 2,
      },
    ],
  };

  it("aceita payload válido de sessão", () => {
    const result = sessionSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("aceita sets vazio (array padrão)", () => {
    const result = sessionSchema.safeParse({
      workoutName: "Treino vazio",
      startedAt: "2025-01-15T10:00:00Z",
      sets: [],
    });
    expect(result.success).toBe(true);
  });

  it("aceita set de cardio com durationSec", () => {
    const result = sessionSchema.safeParse({
      ...validPayload,
      sets: [
        {
          exerciseId: "ex-2",
          exerciseName: "Esteira",
          weight: 0,
          reps: 0,
          durationSec: 1800,
          distanceKm: 5,
          avgBpm: 140,
          intensity: "Moderada",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejeita workoutName vazio", () => {
    const result = sessionSchema.safeParse({
      ...validPayload,
      workoutName: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("workoutName");
    }
  });

  it("rejeita peso negativo", () => {
    const result = sessionSchema.safeParse({
      ...validPayload,
      sets: [{ ...validPayload.sets[0], weight: -5 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita reps negativo", () => {
    const result = sessionSchema.safeParse({
      ...validPayload,
      sets: [{ ...validPayload.sets[0], reps: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita mais de 500 sets", () => {
    const sets = Array.from({ length: 501 }, (_, i) => ({
      exerciseId: `ex-${i}`,
      exerciseName: `Ex ${i}`,
      weight: 20,
      reps: 10,
    }));
    const result = sessionSchema.safeParse({
      ...validPayload,
      sets,
    });
    expect(result.success).toBe(false);
  });

  it("workoutId opcional e nullable", () => {
    const result1 = sessionSchema.safeParse({
      ...validPayload,
      workoutId: "wk-1",
    });
    expect(result1.success).toBe(true);

    const result2 = sessionSchema.safeParse({
      ...validPayload,
      workoutId: null,
    });
    expect(result2.success).toBe(true);

    const result3 = sessionSchema.safeParse({
      ...validPayload,
      workoutId: undefined,
    });
    expect(result3.success).toBe(true);
  });
});

// ─── parseIntParam ──────────────────────────────────────────────────

describe("parseIntParam", () => {
  const opts = { default: 50, min: 1, max: 200 };

  it("retorna o valor quando válido", () => {
    expect(parseIntParam("100", opts)).toBe(100);
  });

  it("retorna default quando null", () => {
    expect(parseIntParam(null, opts)).toBe(50);
  });

  it("retorna default quando string inválida", () => {
    expect(parseIntParam("abc", opts)).toBe(50);
    expect(parseIntParam("", opts)).toBe(50);
  });

  it("clampa para min", () => {
    expect(parseIntParam("0", opts)).toBe(1);
    expect(parseIntParam("-5", opts)).toBe(1);
  });

  it("clampa para max", () => {
    expect(parseIntParam("999", opts)).toBe(200);
  });

  it("lida com float (parseInt trunca)", () => {
    expect(parseIntParam("10.7", opts)).toBe(10);
  });
});
