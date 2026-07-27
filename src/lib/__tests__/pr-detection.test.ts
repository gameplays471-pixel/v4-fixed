import { describe, it, expect } from "vitest";

/**
 * A lógica real de detecção de PR está em `/app/api/sessions/route.ts`
 * como uma query Prisma inline. Este arquivo testa a lógica **puramente
 * algébrica** que a rota usa — e que deveria ser extraída para uma função
 * testável quando houver oportunidade.
 *
 * Regra atual (extraída da rota):
 *   isPR = !previousMax || currentWeight > previousMax.weight
 *   (cardio com durationSec nunca é PR)
 */

/** Replica a lógica exata do POST /api/sessions */
function detectPR(currentWeight: number, previousMaxWeight: number | null, isCardio: boolean): boolean {
  if (isCardio) return false;
  return !previousMaxWeight || currentWeight > previousMaxWeight;
}

describe("Detecção de PR (Personal Record)", () => {
  it("primeiro set do exercício é sempre PR (sem histórico)", () => {
    expect(detectPR(20, null, false)).toBe(true);
    expect(detectPR(1, null, false)).toBe(true);
    expect(detectPR(0.5, null, false)).toBe(true);
  });

  it("peso maior que o anterior é PR", () => {
    expect(detectPR(22.5, 20, false)).toBe(true);
    expect(detectPR(100, 97.5, false)).toBe(true);
    expect(detectPR(60, 50, false)).toBe(true);
  });

  it("peso igual ao anterior NÃO é PR", () => {
    expect(detectPR(20, 20, false)).toBe(false);
    expect(detectPR(60, 60, false)).toBe(false);
  });

  it("peso menor que o anterior NÃO é PR (mesmo com mais reps)", () => {
    // Nota: a lógica atual só compara peso, não volume.
    // 15 reps × 15kg = 225kg de volume vs 10 reps × 20kg = 200kg
    // Volume maior, mas peso menor → não é PR na lógica atual.
    expect(detectPR(15, 20, false)).toBe(false);
  });

  it("cardio (com durationSec) nunca é PR", () => {
    expect(detectPR(0, null, true)).toBe(false);
    expect(detectPR(10, 5, true)).toBe(false);
    expect(detectPR(80, 0, true)).toBe(false);
  });

  it("cenário completo: vários sets, só o maior peso conta", () => {
    // Simula: usuário fez 3 sets: 20kg, 22.5kg, 20kg
    // O PR anterior era 22.5kg (de uma sessão passada)
    // Nenhum set superou → nenhum PR
    const previousMax = 22.5;
    expect(detectPR(20, previousMax, false)).toBe(false);
    expect(detectPR(22.5, previousMax, false)).toBe(false);

    // Agora o usuário fez 25kg → PR!
    expect(detectPR(25, previousMax, false)).toBe(true);
  });

  it("margem mínima: 0.1kg a mais já é PR", () => {
    expect(detectPR(20.1, 20, false)).toBe(true);
  });

  it("regressão: peso 0 no histórico não bloqueia PR", () => {
    // Se o banco retornar peso 0 por algum bug, o primeiro
    // set real ainda deve ser PR.
    expect(detectPR(20, 0, false)).toBe(true);
  });
});
