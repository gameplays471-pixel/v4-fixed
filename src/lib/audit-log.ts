// Registro de auditoria do painel administrativo.
//
// Toda ação de escrita disparada pelo admin (criar/editar/excluir um
// exercício, alterar um usuário, mudar uma configuração do site) deve
// chamar `recordAudit` depois de confirmar que a operação no banco deu
// certo. Guardamos snapshots "antes" e "depois" como JSON — isso permite
// reconstruir o diff exato sem depender de triggers no Postgres, e serve
// tanto para rastreabilidade (importante ao comercializar o software)
// quanto para debugar "quem mudou isso e quando" no suporte.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export type AuditAction = "create" | "update" | "delete";

interface RecordAuditInput {
  req: NextRequest;
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}

/**
 * Grava uma linha de auditoria. Nunca lança — uma falha aqui (ex.: banco
 * fora do ar por 1 request) não deve derrubar a ação principal do admin,
 * então qualquer erro é apenas logado no console do servidor.
 */
export async function recordAudit(input: RecordAuditInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: input.actorId,
        actorEmail: input.actorEmail,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before !== undefined ? JSON.stringify(input.before) : null,
        after: input.after !== undefined ? JSON.stringify(input.after) : null,
        ip: getClientIp(input.req),
      },
    });
  } catch (e) {
    logger.error("[audit-log] falha ao gravar auditoria", {
      entityType: input.entityType,
      entityId: input.entityId,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
