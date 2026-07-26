// Validação de entrada das API routes com zod.
//
// Antes, o body de requests como POST /api/workouts e POST /api/sessions
// ia direto pro Prisma sem checagem de shape/tipo — um payload malformado
// (campo faltando, tipo errado, string gigante, número fora de faixa)
// tanto podia derrubar a rota com 500 (ex.: `new Date(lixo)` gerando
// Invalid Date, ou `NaN` sendo passado pro Postgres) quanto gravar dado
// inconsistente no banco (ex.: nome vazio, peso negativo, reps string).
//
// `parseBody` centraliza: parse do JSON (corpo malformado agora responde
// 400 em vez de 500), validação do shape com zod, e formatação do erro.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─── Helper genérico ────────────────────────────────────────────────────────

type ParseResult<T> = { success: true; data: T } | { success: false; response: NextResponse };

/**
 * Lê e valida o corpo JSON da requisição contra `schema`.
 * Uso:
 *   const parsed = await parseBody(req, workoutCreateSchema);
 *   if (!parsed.success) return parsed.response;
 *   const body = parsed.data; // já tipado e validado
 */
export async function parseBody<S extends z.ZodTypeAny>(
  req: NextRequest,
  schema: S
): Promise<ParseResult<z.infer<S>>> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: "Corpo da requisição inválido (JSON malformado)" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Dados inválidos",
          details: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Valida um valor numérico de query string (ex.: `?limit=50`) com fallback
 * seguro em vez de deixar `NaN`/lixo chegar no Prisma (ex.: `take: NaN`).
 */
export function parseIntParam(value: string | null, opts: { default: number; min: number; max: number }): number {
  const n = value ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(n)) return opts.default;
  return Math.min(opts.max, Math.max(opts.min, n));
}

// ─── Schemas compartilhados ──────────────────────────────────────────────────

const id = z.string().trim().min(1, "id é obrigatório").max(100);
const optionalNullableString = (max: number) => z.string().trim().max(max).optional().nullable();

// ─── Auth ────────────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  email: z.string().trim().email("Email inválido").max(200),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(200),
  name: z.string().trim().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(200),
  password: z.string().min(1, "Senha é obrigatória").max(200),
  rememberMe: z.boolean().optional(),
});

// ─── Workouts ────────────────────────────────────────────────────────────────

const workoutExerciseSchema = z.object({
  exerciseId: id,
  targetSets: z.coerce.number().int().positive().max(50).optional(),
  targetReps: z.coerce.number().int().positive().max(2000).optional(),
  restSeconds: z.coerce.number().int().nonnegative().max(3600).optional(),
  notes: optionalNullableString(1000),
  targetDurationSec: z.coerce.number().int().positive().max(86400).optional().nullable(),
  targetDistanceKm: z.coerce.number().positive().max(1000).optional().nullable(),
  targetIntensity: optionalNullableString(50),
});

export const workoutSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  description: optionalNullableString(2000),
  defaultRest: z.coerce.number().int().nonnegative().max(3600).optional(),
  color: optionalNullableString(30),
  exercises: z.array(workoutExerciseSchema).max(200).optional(),
});

// ─── Sessions (finalizar treino) ─────────────────────────────────────────────

const sessionSetSchema = z.object({
  exerciseId: id,
  exerciseName: z.string().trim().min(1).max(200),
  weight: z.coerce.number().nonnegative().max(2000),
  reps: z.coerce.number().int().nonnegative().max(10000),
  restSeconds: z.coerce.number().int().nonnegative().max(3600).optional(),
  durationSec: z.coerce.number().int().nonnegative().max(86400).optional().nullable(),
  distanceKm: z.coerce.number().nonnegative().max(1000).optional().nullable(),
  avgBpm: z.coerce.number().int().positive().max(300).optional().nullable(),
  intensity: optionalNullableString(50),
  // RIR (reps in reserve) — alimenta a sugestão de progressão de carga.
  rir: z.coerce.number().nonnegative().max(20).optional().nullable(),
});

export const sessionSchema = z.object({
  workoutId: id.optional().nullable(),
  workoutName: z.string().trim().min(1, "Nome do treino é obrigatório").max(200),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().optional().nullable(),
  durationSec: z.coerce.number().int().nonnegative().max(86400).optional(),
  sets: z.array(sessionSetSchema).max(500).default([]),
  notes: optionalNullableString(2000),
});

// ─── Favoritos ───────────────────────────────────────────────────────────────

export const favoriteSchema = z.object({
  exerciseId: id,
});

// ─── Perfil ──────────────────────────────────────────────────────────────────
// O formulário do client sempre envia string (inputs de texto/select), usando
// "" para representar "campo vazio/não definido" — tratamos "" e undefined
// como null antes de validar o tipo real, senão "" cairia como erro 400 em
// vez de simplesmente limpar o campo (mesmo comportamento que já existia,
// só que agora validado em vez de aceito sem checagem).
const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Nome não pode ser vazio").max(100).optional(),
  bio: z.preprocess(emptyToNull, z.string().trim().max(1000).nullable()).optional(),
  weight: z.preprocess(emptyToNull, z.coerce.number().positive("Peso inválido").max(500).nullable()).optional(),
  height: z.preprocess(emptyToNull, z.coerce.number().positive("Altura inválida").max(300).nullable()).optional(),
  sex: z.preprocess(emptyToNull, z.enum(["M", "F", "Outro"]).nullable()).optional(),
  birthDate: z.preprocess(emptyToNull, z.coerce.date().nullable()).optional(),
  goal: z.preprocess(emptyToNull, z.string().trim().max(500).nullable()).optional(),
  avatarUrl: z.preprocess(emptyToNull, z.string().max(2_000_000).nullable()).optional(), // pode ser data URL (base64) de um avatar
});

// ─── Peso corporal ───────────────────────────────────────────────────────────

export const bodyWeightSchema = z.object({
  weight: z.coerce.number().positive("Peso deve ser maior que zero").max(500, "Peso inválido"),
  bodyFatPercent: z.coerce.number().nonnegative().max(75, "% de gordura corporal inválido").optional().nullable(),
  loggedAt: z.coerce.date().optional().nullable(),
  notes: optionalNullableString(500),
});

// ─── Admin: Exercícios ───────────────────────────────────────────────────────
// `slug` é gerado no servidor a partir do nome (ver src/lib/search-utils.ts
// ou slugify local abaixo) quando não informado — o admin não deveria
// precisar pensar em slug ao cadastrar um exercício novo.

export const exerciseSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug deve conter só letras minúsculas, números e hífen")
    .max(150)
    .optional(),
  muscleGroup: z.string().trim().min(1, "Grupo muscular é obrigatório").max(50),
  secondaryMuscles: optionalNullableString(200),
  equipment: optionalNullableString(100),
  category: z.string().trim().min(1, "Categoria é obrigatória").max(50),
  equipmentType: optionalNullableString(50),
  level: z.string().trim().min(1, "Nível é obrigatório").max(50),
  description: optionalNullableString(2000),
  executionSteps: optionalNullableString(4000),
  commonMistakes: optionalNullableString(2000),
  tips: optionalNullableString(2000),
  images: z.array(z.string().trim().max(2000)).max(10).default([]),
});

export const exerciseUpdateSchema = exerciseSchema.partial();
