import { describe, it, expect } from "vitest";
import { suggestNextLoad, formatTime, type LastSetRecord } from "../utils";
import { parseRir } from "../hooks/session-summary";

// ─── formatTime ──────────────────────────────────────────────────────

describe("formatTime", () => {
  it("formata segundos < 60 como MM:SS", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(59)).toBe("00:59");
  });

  it("formata minutos como MM:SS com zero à esquerda", () => {
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(90)).toBe("01:30");
    expect(formatTime(610)).toBe("10:10");
  });

  it("formata horas como H:MM:SS", () => {
    expect(formatTime(3600)).toBe("1:00:00");
    expect(formatTime(3661)).toBe("1:01:01");
    expect(formatTime(7384)).toBe("2:03:04");
  });
});

// ─── suggestNextLoad ─────────────────────────────────────────────────

describe("suggestNextLoad", () => {
  const targetReps = 10;

  it("retorna null quando não há histórico", () => {
    expect(suggestNextLoad(undefined, targetReps)).toBeNull();
  });

  it("retorna null quando array está vazio", () => {
    expect(suggestNextLoad([], targetReps)).toBeNull();
  });

  it("retorna null quando todos os pesos são 0", () => {
    expect(suggestNextLoad([{ weight: 0, reps: 10 }], targetReps)).toBeNull();
  });

  // ── Sem RIR (heurística conservadora por reps) ──

  describe("sem RIR registrado", () => {
    it("sugere subir peso quando reps média >= meta + 2", () => {
      // Fez 12 reps com 20kg, meta era 10
      const lastSets: LastSetRecord[] = [{ weight: 20, reps: 12 }];
      const result = suggestNextLoad(lastSets, targetReps);

      expect(result).not.toBeNull();
      expect(result!.weight).toBe(22.5); // 20 + 2.5
      expect(result!.message).toContain("22.5kg");
    });

    it("sugere subir peso baseado no top set (ignora sets mais leves)", () => {
      const lastSets: LastSetRecord[] = [
        { weight: 20, reps: 8 },
        { weight: 20, reps: 12 }, // top set: média 10
        { weight: 15, reps: 15 }, // peso menor, ignorado
      ];
      const result = suggestNextLoad(lastSets, targetReps);

      expect(result).not.toBeNull();
      expect(result!.weight).toBe(22.5);
    });

    it("retorna null quando reps média está na meta (sem sinal claro)", () => {
      const lastSets: LastSetRecord[] = [{ weight: 20, reps: 10 }];
      expect(suggestNextLoad(lastSets, targetReps)).toBeNull();
    });

    it("retorna null quando reps média está 1 acima da meta", () => {
      const lastSets: LastSetRecord[] = [{ weight: 20, reps: 11 }];
      // 11 < 10 + 2 = 12, então não sobe
      expect(suggestNextLoad(lastSets, targetReps)).toBeNull();
    });

    it("retorna null quando reps média está abaixo da meta", () => {
      const lastSets: LastSetRecord[] = [{ weight: 20, reps: 7 }];
      expect(suggestNextLoad(lastSets, targetReps)).toBeNull();
    });
  });

  // ── RIR alto (>= 3): sobrou fôlego → subir carga ──

  describe("RIR alto (>= 3)", () => {
    it("sugere +1 placa (2.5kg) quando RIR 3", () => {
      const lastSets: LastSetRecord[] = [{ weight: 20, reps: 10, rir: 3 }];
      const result = suggestNextLoad(lastSets, targetReps);

      expect(result).not.toBeNull();
      expect(result!.weight).toBe(22.5);
      expect(result!.message).toContain("RIR 3");
      expect(result!.message).toContain("22.5kg");
    });

    it("sugere +1 placa quando RIR 5", () => {
      const lastSets: LastSetRecord[] = [{ weight: 40, reps: 8, rir: 5 }];
      const result = suggestNextLoad(lastSets, 8);

      expect(result).not.toBeNull();
      expect(result!.weight).toBe(42.5);
    });

    it("usa o pior RIR entre vários top sets", () => {
      const lastSets: LastSetRecord[] = [
        { weight: 20, reps: 10, rir: 4 },
        { weight: 20, reps: 10, rir: 3 }, // pior RIR = 3
      ];
      const result = suggestNextLoad(lastSets, targetReps);

      // Pior RIR é 3, ainda >= 3, então sobe
      expect(result).not.toBeNull();
      expect(result!.weight).toBe(22.5);
      expect(result!.message).toContain("RIR 3");
    });

    it("usa o pior RIR: se um set tem RIR 2, não sobe", () => {
      const lastSets: LastSetRecord[] = [
        { weight: 20, reps: 10, rir: 4 },
        { weight: 20, reps: 10, rir: 2 }, // pior RIR = 2
      ];
      const result = suggestNextLoad(lastSets, targetReps);

      // Pior RIR é 2, então mantém e sugere +1 rep
      expect(result).not.toBeNull();
      expect(result!.weight).toBe(20);
      expect(result!.message).toContain("+1 rep");
    });
  });

  // ── RIR médio (1–2): desafiador → manter peso, +1 rep ──

  describe("RIR médio (1-2)", () => {
    it("RIR 2: mantém peso, sugere +1 rep", () => {
      const lastSets: LastSetRecord[] = [{ weight: 60, reps: 10, rir: 2 }];
      const result = suggestNextLoad(lastSets, targetReps);

      expect(result).not.toBeNull();
      expect(result!.weight).toBe(60);
      expect(result!.message).toContain("+1 rep");
      expect(result!.message).toContain("RIR 2");
    });

    it("RIR 1: mantém peso, sugere +1 rep", () => {
      const lastSets: LastSetRecord[] = [{ weight: 60, reps: 10, rir: 1 }];
      const result = suggestNextLoad(lastSets, targetReps);

      expect(result).not.toBeNull();
      expect(result!.weight).toBe(60);
      expect(result!.message).toContain("+1 rep");
      expect(result!.message).toContain("RIR 1");
    });
  });

  // ── RIR 0: foi até o limite → manter peso ──

  describe("RIR 0 (falha)", () => {
    it("mantém o peso e não sugere subir nem +1 rep", () => {
      const lastSets: LastSetRecord[] = [{ weight: 80, reps: 10, rir: 0 }];
      const result = suggestNextLoad(lastSets, targetReps);

      expect(result).not.toBeNull();
      expect(result!.weight).toBe(80);
      expect(result!.message).toContain("RIR 0");
      expect(result!.message).toContain("mantenha");
      expect(result!.message).not.toContain("+1 rep");
    });
  });

  // ── Edge cases ──

  describe("edge cases", () => {
    it("ignora sets com RIR null quando outros têm RIR numérico", () => {
      const lastSets: LastSetRecord[] = [
        { weight: 20, reps: 10, rir: null },
        { weight: 20, reps: 10, rir: 3 },
      ];
      // recordedRirs = [3], pior = 3 → sobe
      const result = suggestNextLoad(lastSets, targetReps);
      expect(result).not.toBeNull();
      expect(result!.weight).toBe(22.5);
    });

    it("arredonda pro incremento de placa (2.5kg)", () => {
      // Se o resultado fosse 21.5, arredondaria pra 22.5
      const lastSets: LastSetRecord[] = [{ weight: 19, reps: 12 }]; // sem RIR, reps >= meta+2
      const result = suggestNextLoad(lastSets, targetReps);

      // 19 + 2.5 = 21.5, roundToIncrement(21.5, 2.5) = 22.5
      expect(result).not.toBeNull();
      expect(result!.weight).toBe(22.5);
    });

    it("lida com múltiplos sets em pesos diferentes (usa o máximo)", () => {
      const lastSets: LastSetRecord[] = [
        { weight: 20, reps: 10, rir: 2 },
        { weight: 25, reps: 8, rir: 4 },
      ];
      // Max weight = 25, RIR 4 → sobe
      const result = suggestNextLoad(lastSets, 8);
      expect(result).not.toBeNull();
      expect(result!.weight).toBe(27.5);
    });
  });
});

// ─── parseRir ────────────────────────────────────────────────────────

describe("parseRir", () => {
  it("retorna undefined para valor vazio", () => {
    expect(parseRir("")).toBeUndefined();
  });

  it("retorna undefined para undefined", () => {
    expect(parseRir(undefined)).toBeUndefined();
  });

  it("parseia número normal", () => {
    expect(parseRir("2")).toBe(2);
    expect(parseRir("0")).toBe(0);
  });

  it("trata '+' como o número (ex.: '4+' vira 4)", () => {
    expect(parseRir("4+")).toBe(4);
    expect(parseRir("2+")).toBe(2);
    expect(parseRir("0+")).toBe(0);
  });

  it("retorna undefined para texto inválido", () => {
    expect(parseRir("abc")).toBeUndefined();
    expect(parseRir("--")).toBeUndefined();
  });

  it("parseia decimal", () => {
    expect(parseRir("1.5")).toBe(1.5);
  });
});
