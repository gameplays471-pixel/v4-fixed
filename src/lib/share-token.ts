import crypto from "crypto";

/** Token opaco de 12 caracteres (base64url) — curto o bastante pra caber num link, não-adivinhável. */
export function generateShareToken(): string {
  return crypto.randomBytes(9).toString("base64url");
}
