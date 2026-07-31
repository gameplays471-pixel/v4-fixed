/**
 * Avatares devem ser URLs públicas (Vercel Blob via POST /api/profile/avatar).
 * Data URLs base64 legadas no banco são tratadas como ausentes nas respostas.
 */
export function isHttpAvatarUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return url.startsWith("https://") || url.startsWith("http://");
}

export function publicAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (isHttpAvatarUrl(url)) return url;
  return null;
}

export function isDataUrlAvatar(url: string | null | undefined): boolean {
  return !!url && url.startsWith("data:");
}
