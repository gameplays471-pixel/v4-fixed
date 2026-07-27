import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // Usa a mesma resolução de caminhos do tsconfig.json
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // Ambiente padrão: node (suficiente pra lógica pura).
    // Quando adicionar testes de componente, use:
    //   // @vitest-environment jsdom
    // no topo do arquivo ou configure 'environment: "jsdom"' aqui.
    environment: "node",

    // Arquivos de teste
    include: ["src/**/*.test.{ts,tsx}"],

    // Excluir pastas que não são de teste
    exclude: ["node_modules", ".next", "public"],

    // Cobertura (opcional — ativar com `vitest run --coverage`)
    coverage: {
      provider: "v8",
      include: [
        "src/components/views/active-workout/utils.ts",
        "src/lib/validation.ts",
        "src/components/views/active-workout/hooks/session-summary.ts",
      ],
    },
  },
});
