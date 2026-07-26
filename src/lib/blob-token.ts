// A Vercel normalmente injeta o token de leitura/escrita do Blob Storage
// como `BLOB_READ_WRITE_TOKEN`. Mas quando o projeto tem mais de uma Blob
// store (ou dependendo de como a conexão foi feita pelo painel), ela pode
// prefixar o nome com o nome dado ao token/store — por exemplo
// `MEUSTORE_READ_WRITE_TOKEN` em vez do nome padrão. Este helper cobre os
// dois casos.
//
// Importante: variáveis como `*_STORE_ID` e `*_WEBHOOK_PUBLIC_KEY` NÃO são
// tokens de autenticação — são metadados (o id do store) e uma chave pública
// pra verificar assinatura de webhooks, respectivamente. Nunca as usamos
// aqui como substituto do token: isso só trocaria um erro claro por um 401
// confuso vindo da API da Vercel.

const TOKEN_SUFFIX = "_READ_WRITE_TOKEN";

/** Retorna o token de leitura/escrita do Blob, ou null se nenhum for encontrado. */
export function resolveBlobToken(): string | null {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  const altKey = Object.keys(process.env).find(
    (k) => k.endsWith(TOKEN_SUFFIX) && k !== "BLOB_READ_WRITE_TOKEN"
  );
  if (altKey) {
    const value = process.env[altKey];
    if (value) return value;
  }

  return null;
}

/**
 * Descreve o que foi encontrado nas variáveis de ambiente relacionadas ao
 * Blob — usado só para montar uma mensagem de erro mais útil (nunca loga o
 * valor das variáveis, só os nomes).
 */
export function describeBlobEnvState(): string {
  const related = Object.keys(process.env).filter(
    (k) => k.includes("BLOB") && (k.includes("TOKEN") || k.includes("STORE_ID") || k.includes("WEBHOOK"))
  );
  if (related.length === 0) {
    return "Nenhuma variável de ambiente relacionada ao Blob foi encontrada.";
  }
  return `Variáveis encontradas: ${related.join(", ")} — nenhuma delas é um token de leitura/escrita válido (STORE_ID e WEBHOOK_PUBLIC_KEY são metadados, não credenciais de acesso).`;
}
