import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { loginSchema, LoginFormData } from "../_schemas/auth.schema"
import { createClient } from "@/lib/supabase/client"

export const useAuthForm = () => {
  const router = useRouter()
  const supabase = createClient()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const { data: session, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error
      return session
    },

    onSuccess: () => {
      toast.success("Login realizado com sucesso")
      router.push("/")
    },

    onError: (err: Error) => {
      if (err.message === "Invalid login credentials") {
        toast.error("Email ou senha inválidos")
      } else {
        toast.error(err.message)
      }
    },
  })

  const onLogin = (data: LoginFormData) => {
    mutation.mutate(data)
  }

  return {
    loginForm,
    onLogin,
    isLoading: mutation.isPending,
  }
}