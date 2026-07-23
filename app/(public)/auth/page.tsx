import { LoginForm } from "./_components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      <div className="hidden lg:flex flex-col items-center justify-center gap-6 bg-primary">
        <div className="flex flex-col items-center gap-2 text-primary-foreground">
          <h1 className="text-3xl font-bold tracking-tight">Cestas Tribos</h1>
          <p className="text-lg text-primary-foreground/80">
            Gestão de entregas para comunidades
          </p>
        </div>
      </div>
    </div>
  )
}
