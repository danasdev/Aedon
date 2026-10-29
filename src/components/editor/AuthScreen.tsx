import { useState } from "react";
import { signInWithPassword, signUpWithPassword } from "@/lib/supabase/auth";
import { Loader2 } from "lucide-react";
import { AedonLogo } from "./AedonMark";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "login") {
        await signInWithPassword(email.trim(), password);
      } else {
        const { needsConfirmation } = await signUpWithPassword(email.trim(), password);
        if (needsConfirmation) {
          setInfo("Conta criada. Confirme pelo e-mail que enviamos para entrar.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-start">
          <AedonLogo />
          <p className="ae-eyebrow mt-8">{mode === "login" ? "// entrar" : "// nova conta"}</p>
          <h1 className="ae-display mt-2 text-3xl">
            {mode === "login" ? "Seus sites" : "Crie sua conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Entre para continuar de onde parou." : "Leva menos de um minuto."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="E-mail"
            placeholder="voce@email.com"
            className="ae-input"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Senha"
            placeholder="Senha (mín. 6 caracteres)"
            className="ae-input"
          />

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-lg border border-ion/30 bg-ion/10 px-3 py-2 text-xs text-ion">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="ae-btn ae-btn-primary ae-btn-lg mt-2 w-full"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "login" ? "signup" : "login"));
            setError(null);
            setInfo(null);
          }}
          className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {mode === "login" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
