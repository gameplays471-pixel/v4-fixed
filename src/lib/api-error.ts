import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getCurrentUser, type SelectedUser } from "@/lib/auth";
import { logger, newRequestId } from "@/lib/logger";

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
 * Mesma ideia de `requireUser`, mas também exige `role === "admin"`.
 * Uso em toda rota sob `/api/admin/*`:
 *   const admin = await requireAdmin(req);
 * Retorna 401 se não estiver logado, 403 se estiver logado mas sem ser admin
 * — distinção importante pro frontend saber se deve mandar pro login ou
 * só esconder a opção de admin.
 */
export async function requireAdmin(req: NextRequest): Promise<SelectedUser> {
  const user = await getCurrentUser(req);
  if (!user) throw unauthorized();
  if (user.role !== "admin") throw forbidden("Acesso restrito a administradores");
  return user;
}

/**
 * Envolve um handler de rota (GET/POST/PUT/DELETE) padronizando o
 * tratamento de erro:
 * - `ApiError` (lançado por um dos helpers acima, ou diretamente) vira a
 *   resposta `{ error: message }` com o status escolhido, e um log `warn`
 *   estruturado (não vai pro Sentry — não é bug).
 * - `SyntaxError` (ex.: `await req.json()` com corpo malformado) vira 400.
 * - Qualquer outro erro (bug, falha do banco, etc.) é logado em nível
 *   `error` via `logger` e reportado ao Sentry com o nome da rota e um
 *   `requestId`, que também volta na resposta 500 — nunca vaza stack
 *   trace ou mensagem interna pro cliente, mas dá uma referência pra
 *   achar o erro exato no Sentry/logs depois.
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
        // Erro esperado (validação, 404, permissão) — não é bug, não vai
        // pro Sentry. Ainda assim vira uma linha de log em nível `warn`,
        // útil pra notar padrões (ex.: muitos 409 num endpoint específico
        // pode indicar um problema de UX, não só "usuário errou").
        logger.warn(`${routeName} — ${e.status}`, { route: routeName, status: e.status, message: e.message });
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      if (e instanceof SyntaxError) {
        return NextResponse.json({ error: "JSON inválido no corpo da requisição" }, { status: 400 });
      }

      // Erro de verdade (bug, banco fora do ar, etc.): log estruturado +
      // Sentry. O requestId volta pro cliente pra quem for reportar o
      // problema (email de suporte, print) conseguir dar uma referência
      // que você acha em segundos no log/Sentry, em vez de "tava dando
      // erro ali, sei lá quando".
      const requestId = newRequestId();
      logger.error(`${routeName} — erro inesperado`, {
        route: routeName,
        requestId,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      Sentry.captureException(e, { tags: { route: routeName, requestId } });

      return NextResponse.json({ error: "Erro interno", requestId }, { status: 500 });
    }
  };
}
