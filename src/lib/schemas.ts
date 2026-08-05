/**
 * Schemas Zod centralizados para validação de entrada das rotas de API.
 *
 * Cada schema é exportado com seu tipo inferido para reuso nos handlers.
 * Regras gerais aplicadas:
 *  - Strings: trim() para remover espaços acidentais
 *  - Tamanhos máximos explícitos para evitar payloads gigantes
 *  - Números: limites razoáveis para dados de treino
 *  - Campos opcionais: nullable() ou optional() conforme o banco
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const LoginSchema = z.object({
  email: z
    .string({ required_error: "Email é obrigatório" })
    .trim()
    .email("Email inválido")
    .max(254, "Email muito longo"),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(128, "Senha muito longa"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const SignupSchema = z.object({
  email: z
    .string({ required_error: "Email é obrigatório" })
    .trim()
    .email("Email inválido")
    .max(254, "Email muito longo"),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(128, "Senha muito longa"),
  name: z
    .string()
    .trim()
    .max(100, "Nome muito longo")
    .optional(),
});
export type SignupInput = z.infer<typeof SignupSchema>;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const SEX_VALUES = ["M", "F", "Outro"] as const;

export const UpdateProfileSchema = z.object({
  name: z
    .string({ required_error: "Nome é obrigatório" })
    .trim()
    .min(1, "Nome não pode ser vazio")
    .max(100, "Nome muito longo"),
  bio: z.string().trim().max(500, "Bio muito longa").optional().nullable(),
  weight: z
    .number()
    .positive("Peso deve ser positivo")
    .max(500, "Peso fora do intervalo")
    .optional()
    .nullable(),
  height: z
    .number()
    .positive("Altura deve ser positiva")
    .max(300, "Altura fora do intervalo")
    .optional()
    .nullable(),
  sex: z.enum(SEX_VALUES).optional().nullable(),
  birthDate: z
    .string()
    .datetime({ message: "Data de nascimento inválida" })
    .optional()
    .nullable(),
  goal: z.string().trim().max(200, "Objetivo muito longo").optional().nullable(),
  avatarUrl: z
    .string()
    .trim()
    .url("URL do avatar inválida")
    .max(2048, "URL muito longa")
    .optional()
    .nullable(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ---------------------------------------------------------------------------
// Workouts
// ---------------------------------------------------------------------------

const WorkoutExerciseSchema = z.object({
  exerciseId: z.string().cuid("ID de exercício inválido"),
  targetSets: z.number().int().min(1).max(100).default(3),
  targetReps: z.number().int().min(1).max(1000).default(10),
  restSeconds: z.number().int().min(0).max(3600).default(90),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const CreateWorkoutSchema = z.object({
  name: z
    .string({ required_error: "Nome é obrigatório" })
    .trim()
    .min(1, "Nome não pode ser vazio")
    .max(100, "Nome muito longo"),
  description: z.string().trim().max(500).optional().nullable(),
  defaultRest: z.number().int().min(0).max(3600).default(90),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor deve ser um hex válido (ex: #ff0000)")
    .optional()
    .nullable(),
  exercises: z.array(WorkoutExerciseSchema).max(50, "Máximo de 50 exercícios por treino").default([]),
});
export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export const UpdateWorkoutSchema = CreateWorkoutSchema;
export type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

const SessionSetSchema = z.object({
  exerciseId: z.string().cuid("ID de exercício inválido"),
  exerciseName: z.string().trim().min(1).max(150),
  weight: z.number().min(0).max(10000),
  reps: z.number().int().min(0).max(10000),
  restSeconds: z.number().int().min(0).max(3600).default(90),
});

export const CreateSessionSchema = z.object({
  workoutId: z.string().cuid("ID de treino inválido").optional().nullable(),
  workoutName: z
    .string({ required_error: "Nome do treino é obrigatório" })
    .trim()
    .min(1)
    .max(150),
  startedAt: z.string().datetime({ message: "Data de início inválida" }),
  endedAt: z.string().datetime({ message: "Data de fim inválida" }).optional().nullable(),
  durationSec: z.number().int().min(0).max(86400).default(0),
  notes: z.string().trim().max(1000).optional().nullable(),
  sets: z.array(SessionSetSchema).max(500, "Máximo de 500 sets por sessão").default([]),
});
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export const ToggleFavoriteSchema = z.object({
  exerciseId: z.string().cuid("ID de exercício inválido"),
});
export type ToggleFavoriteInput = z.infer<typeof ToggleFavoriteSchema>;

// ---------------------------------------------------------------------------
// Helper — parseia e retorna 400 formatado em caso de erro
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

export function parseBody<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: ReturnType<typeof NextResponse.json> } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return {
      success: false,
      response: NextResponse.json(
        { error: "Dados inválidos", details: errors },
        { status: 400 }
      ),
    };
  }
  return { success: true, data: result.data };
}
