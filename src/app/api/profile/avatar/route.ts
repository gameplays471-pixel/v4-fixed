import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { badRequest, requireUser, withErrorHandling } from "@/lib/api-error";
import { resolveBlobToken, describeBlobEnvState } from "@/lib/blob-token";

// Folga confortável acima do que a compressão no cliente deve gerar (ver
// src/lib/progress-photo.ts compressImage, usada também aqui pela tela de Perfil).
const MAX_AVATAR_BYTES = 8 * 1024 * 1024;

// Envia/substitui a foto de avatar do usuário logado. Espera a imagem já
// redimensionada e comprimida pelo cliente, em base64 (data URL).
export const POST = withErrorHandling("Upload avatar", async (req: NextRequest) => {
  const user = await requireUser(req);

  const blobToken = resolveBlobToken();
  if (!blobToken) {
    throw badRequest(
      `Armazenamento de fotos não configurado neste ambiente. ${describeBlobEnvState()} ` +
      "No painel da Vercel, abra o Blob Store → aba \"Quickstart\"/.env.local → clique em \"Show secret\" pra revelar o valor de BLOB_READ_WRITE_TOKEN, e adicione-o manualmente em Settings → Environment Variables do projeto (Production and Preview) — depois redeploy."
    );
  }

  const body = await req.json();
  const { image } = body;

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
  if (buffer.length > MAX_AVATAR_BYTES) {
    throw badRequest("Foto muito grande (máx. 8MB) — tente novamente, a compressão automática deveria evitar isso");
  }

  const extension = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const pathname = `avatars/${user.id}/${Date.now()}.${extension}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: mimeType,
    addRandomSuffix: true,
    token: blobToken,
  });

  const updated = await db.user.update({
    where: { id: user.id },
    data: { avatarUrl: blob.url },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      weight: true,
      height: true,
      sex: true,
      birthDate: true,
      goal: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({ user: updated });
});
