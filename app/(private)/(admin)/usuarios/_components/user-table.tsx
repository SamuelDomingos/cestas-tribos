"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Pencil, Trash2, Users } from "lucide-react"
import type { UserOutput } from "@/lib/api/types/users.types"

export function UserTable({
  users,
  isLoading,
  isError,
  onEdit,
  onDelete,
}: {
  users: UserOutput[]
  isLoading: boolean
  isError: boolean
  onEdit: (user: UserOutput) => void
  onDelete: (user: UserOutput) => void
}
) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  // Estado de erro
  if (isError) {
    return (
      <div className="flex items-center justify-center rounded-none border p-8 text-xs text-destructive">
        Erro ao carregar usuários. Tente novamente.
      </div>
    )
  }

  // Estado vazio
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-none border p-8 text-xs text-muted-foreground">
        <Users className="size-8" />
        <p>Nenhum usuário cadastrado ainda.</p>
        <p>Clique em &ldquo;Novo Usuário&rdquo; para começar.</p>
      </div>
    )
  }

  return (
    <div className="rounded-none border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Tribo</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead className="w-20 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {user.email}
              </TableCell>
              <TableCell>{user.tribeName || "—"}</TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role === "admin" ? "Admin" : "Usuário"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(user)}
                    aria-label={`Editar ${user.name}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(user)}
                    aria-label={`Excluir ${user.name}`}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
