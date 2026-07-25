import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, type SelectedUser } from "@/lib/auth";

/**
 * Erro "esperado" de uma rota de API — validação, autenticação, recurso não
 * encontrado, conflito, etc. Lance um `ApiError` (ou use os helpers abaixo)
 * de qualquer lugar dentro de um handler envolvido por `withErrorHandling`;
 * a resposta JSON `{ error: message }` com o status certo é montada
 * automaticamente, sem precisar repetir `NextResponse.json(...)` em cada rota.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const badRequest = (message: string) => new ApiError(message, 400);
export const unauthorized = (message = "Não autorizado") => new ApiError(message, 401);
export const forbidden = (message = "Acesso negado") => new ApiError(message, 403);
export const notFound = (message = "Não encontrado") => new ApiError(message, 404);
export const conflict = (message: string) => new ApiError(message, 409);

/**
 * Busca o usuário autenticado ou lança 401. Substitui o padrão repetido
 * `const user = await getCurrentUser(req); if (!user) return ...401`.
 * Não usar em rotas onde a ausência de usuário é um caso válido (ex.: rotas
 * que devolvem `{ dados: [] }` para visitante deslogado) — nesse caso,
 * continue chamando `getCurrentUser` diretamente.
 */
export async function requireUser(req: NextRequest): Promise<SelectedUser> {
  const user = await getCurrentUser(req);
  if (!user) throw unauthorized();
  return user;
}

/**
 * Envolve um handler de rota (GET/POST/PUT/DELETE) padronizando o
 * tratamento de erro:
 * - `ApiError` (lançado por um dos helpers acima, ou diretamente) vira a
 *   resposta `{ error: message }` com o status escolhido.
 * - `SyntaxError` (ex.: `await req.json()` com corpo malformado) vira 400.
 * - Qualquer outro erro (bug, falha do banco, etc.) é logado com o nome da
 *   rota via `console.error` e retorna 500 genérico — nunca vaza stack
 *   trace ou mensagem interna pro cliente.
 *
 * `routeName` é só para identificar a origem do erro no log do servidor
 * (ex.: "GET /api/workouts"). Para rotas com segmento dinâmico (`[id]`),
 * informe o tipo do 2º argumento explicitamente:
 * `withErrorHandling<{ params: Promise<{ id: string }> }>("...", handler)`.
 */
export function withErrorHandling<Ctx = any>(
  routeName: string,
  handler: (req: NextRequest, ctx: Ctx) => Promise<Response> | Response
) {
  return async (req: NextRequest, ctx: Ctx): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof ApiError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      if (e instanceof SyntaxError) {
        return NextResponse.json({ error: "JSON inválido no corpo da requisição" }, { status: 400 });
      }
      console.error(`${routeName} error:`, e);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  };
}
