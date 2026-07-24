import { put } from "@vercel/blob";

export async function handleAvatarUpload(file: File | null) {
  if (!file || file.size === 0) return undefined;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Tipo de arquivo não permitido");
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Arquivo muito grande (máx 5MB)");
  }

  const fileName = `avatars/${Date.now()}-${file.name}`;

  const blob = await put(fileName, file, {
    access: "public",
  });

  return blob.url;
}
