import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { badRequest, requireUser, withErrorHandling } from "@/lib/api-error";

// Folga confortável acima do que a compressão no cliente deve gerar
// (fotos são redimensionadas + comprimidas em JPEG antes do upload).
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

// Listar fotos de progresso do usuário (mais recente primeiro)
export const GET = withErrorHandling("Get progress photos", async (req: NextRequest) => {
  const user = await requireUser(req);

  const photos = await db.progressPhoto.findMany({
    where: { userId: user.id },
    orderBy: { takenAt: "desc" },
  });

  return NextResponse.json({ photos });
});

// Enviar uma nova foto de progresso. Espera a imagem já redimensionada e
// comprimida pelo cliente, em base64 (data URL) — ver
// src/lib/progress-photo.ts (compressImage) usado pela tela de Corpo.
export const POST = withErrorHandling("Create progress photo", async (req: NextRequest) => {
  const user = await requireUser(req);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Mesmo espírito do SESSION_SECRET: falha alto e claro em vez de um
    // 500 genérico quando falta configurar a infraestrutura em produção.
    throw badRequest(
      "Armazenamento de fotos não configurado neste ambiente. No painel da Vercel: Storage → Create Database → Blob, conecte ao projeto e redeploy (a variável BLOB_READ_WRITE_TOKEN é adicionada automaticamente)."
    );
  }

  const body = await req.json();
  const { image, takenAt, notes, weight } = body;

  if (!image || typeof image !== "string") {
    throw badRequest("Imagem não enviada");
  }

  const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    throw badRequest("Formato de imagem inválido — envie uma data URL base64 (image/jpeg ou image/png)");
  }
  const [, mimeType, base64Data] = match;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64Data, "base64");
  } catch {
    throw badRequest("Não foi possível decodificar a imagem");
  }

  if (buffer.length === 0) {
    throw badRequest("Imagem vazia");
  }
  if (buffer.length > MAX_PHOTO_BYTES) {
    throw badRequest("Foto muito grande (máx. 8MB) — tente novamente, a compressão automática deveria evitar isso");
  }

  let weightNum: number | null = null;
  if (weight !== undefined && weight !== null && weight !== "") {
    const parsed = Number(weight);
    if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 500) weightNum = parsed;
  }

  const extension = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const pathname = `progress-photos/${user.id}/${Date.now()}.${extension}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: mimeType,
    addRandomSuffix: true,
  });

  const photo = await db.progressPhoto.create({
    data: {
      userId: user.id,
      url: blob.url,
      pathname: blob.pathname,
      takenAt: takenAt ? new Date(takenAt) : new Date(),
      weight: weightNum,
      notes: notes || null,
    },
  });

  return NextResponse.json({ photo });
});
