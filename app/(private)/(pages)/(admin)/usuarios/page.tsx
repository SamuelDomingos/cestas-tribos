"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import { useUsers, useDeleteUser } from "./_hooks/use-users"
import { UserTable } from "./_components/user-table"
import { UserDialog } from "./_components/user-dialog"
import type { UserOutput } from "@/lib/api/types/users.types"

export default function UsuariosPage() {
  const { data: users = [], isLoading, isError } = useUsers()
  const deleteUser = useDeleteUser()

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<UserOutput | undefined>(
    undefined,
  )

  function handleNewUser() {
    setEditingUser(undefined)
    setDialogOpen(true)
  }

  function handleEdit(user: UserOutput) {
    setEditingUser(user)
    setDialogOpen(true)
  }

  function handleDelete(user: UserOutput) {
    if (window.confirm(`Tem certeza que deseja excluir "${user.name}"?`)) {
      deleteUser.mutate(user.id)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-sm font-medium">Usuários</h1>
          <p className="text-xs text-muted-foreground">
            Gerencie os membros cadastrados no sistema.
          </p>
        </div>
        <Button size="sm" onClick={handleNewUser}>
          <Plus className="size-3.5" />
          Novo Usuário
        </Button>
      </div>

      {/* Tabela */}
      <UserTable
        users={users}
        isLoading={isLoading}
        isError={isError}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Dialog de cadastro/edição */}
      <UserDialog
        mode={editingUser ? "edit" : "create"}
        user={editingUser}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingUser(undefined)
        }}
      />
    </div>
  )
}
