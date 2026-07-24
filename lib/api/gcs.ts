import type { GC } from "@/lib/generated/prisma/client";

export const createdGC = async (
  formData: FormData,
): Promise<GC & { year: number; month: number; quantityMembers: number }> => {
  const response = await fetch("/api/gc", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao criar GC");
  }

  return response.json();
};

export const updateGC = async (
  id: string,
  formData: FormData,
): Promise<GC & { year: number; month: number; quantityMembers: number }> => {
  const response = await fetch(`/api/gc?id=${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao atualizar GC");
  }

  return response.json();
};

export const deleteGc = async (id: string) => {
  const response = await fetch(`/api/gc?id=${id}`, {
    method: "DELETE",
  });
  return response.json();
};
