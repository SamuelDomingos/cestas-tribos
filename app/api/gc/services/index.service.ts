import prisma from "@/lib/prisma";
import { z } from "zod";

import { handleAvatarUpload } from "./avatarUpload.service";

const GCSchema = z.object({
  name: z.string().min(2).max(50),
  avatar: z.string().optional().nullable(),
  tribe: z.string().min(1, "Tribo é obrigatória"),
});

export const GCService = {
  async createGC(formData: FormData) {
    try {
      const name = formData.get("name")?.toString();
      const avatarFile = formData.get("avatar") as File | null;
      const tribo = formData.get("tribo")?.toString();

      if (!name || !tribo) {
        return { success: false, error: "Dados obrigatórios ausentes" };
      }

      const avatarPath = await handleAvatarUpload(avatarFile);

      const validatedData = GCSchema.parse({
        name,
        avatar: avatarPath,
        tribe: tribo,
      });

      const gc = await prisma.gC.create({
        data: {
          name: validatedData.name,
          avatar: validatedData.avatar ?? undefined,
          tribe: validatedData.tribe,
        },
      });

      return { success: true, data: gc };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: "Dados inválidos", details: error };
      }

      return { success: false, error: "Erro ao criar GC" };
    }
  },

  async getAllGCs(tribe: string) {
    try {
      const where = tribe ? { tribe } : {};

      const gcs = await prisma.gC.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
          goals: {
            where: { isActive: true },
          },
          deliveries: true,
        },
      });

      return {
        success: true,
        data: gcs,
      };
    } catch (error) {
      console.error("Erro ao buscar GCs:", error);
      return { success: false, error: "Erro ao buscar GCs" };
    }
  },

  async updateGC(id: string, formData: FormData) {
    try {
      const name = formData.get("name")?.toString();
      const tribo = formData.get("tribo")?.toString();
      const avatarFile = formData.get("avatar") as File | null;

      const avatarPath = await handleAvatarUpload(avatarFile);

      const data: Record<string, unknown> = {};
      if (name) data.name = name;
      if (tribo) data.tribe = tribo;
      if (avatarPath !== undefined) data.avatar = avatarPath;

      const gc = await prisma.gC.update({
        where: { id },
        data,
      });

      return { success: true, data: gc };
    } catch (error) {
      console.log(error);
      return { success: false, error: "Erro ao atualizar GC" };
    }
  },

  async deleteGC(id: string) {
    try {
      const gc = await prisma.gC.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro ao deletar GC" };
    }
  },
};
