import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gamepad2, Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DEVI · Ingreso" },
      { name: "description", content: "Accede al panel DEVI para gestionar pacientes y citas." },
      { property: "og:title", content: "DEVI · Ingreso" },
      { property: "og:description", content: "Panel de gestión clínica DEVI." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    try {
      window.localStorage.setItem("devi.user", email);
    } catch {}
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="devi-circuit-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-neutral-100">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
           style={{ background: "radial-gradient(closest-side, #c9a84c55, transparent)" }} />

      <div className="devi-fade-up relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-[#c9a84c]/40 bg-black/40 shadow-[0_0_30px_-8px_#c9a84c88]">
            <Gamepad2 className="h-7 w-7" style={{ color: "#f0d78c" }} />
          </div>
          <h1
            className="text-4xl font-black tracking-[0.35em]"
            style={{ fontFamily: "'Orbitron', sans-serif", color: "#f0d78c", textShadow: "0 0 18px #c9a84c66" }}
          >
            DEVI
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.4em] text-[#c9a84c]/70" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            Device Engagement Virtual
          </p>
        </div>

        {/* Card */}
        <div className="devi-hud-corner rounded-2xl border border-[#c9a84c]/25 bg-neutral-950/70 p-8 backdrop-blur-xl shadow-[0_30px_80px_-30px_#000,0_0_40px_-20px_#c9a84c88]">
          <h2 className="mb-1 text-lg font-semibold text-neutral-100" style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.1em" }}>
            INICIAR SESIÓN
          </h2>
          <p className="mb-6 text-sm text-neutral-400">Ingresa tus credenciales para acceder al panel.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-[#c9a84c]/80">Correo o usuario</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c9a84c]/70" />
                <Input
                  id="email"
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jugador@devi.com"
                  className="h-11 border-[#c9a84c]/25 bg-black/50 pl-10 text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#c9a84c] focus-visible:ring-[#c9a84c]/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-[#c9a84c]/80">Contraseña</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c9a84c]/70" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 border-[#c9a84c]/25 bg-black/50 pl-10 text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#c9a84c] focus-visible:ring-[#c9a84c]/40"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="devi-float group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#c9a84c]/60 bg-gradient-to-r from-[#c9a84c] via-[#e6c66a] to-[#c9a84c] font-semibold uppercase tracking-[0.25em] text-neutral-900 transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98]"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Ingresar</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs text-neutral-400 underline-offset-4 transition hover:text-[#f0d78c] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.4em] text-neutral-600">
          v1.0 · Modo demo
        </p>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="border-[#c9a84c]/30 bg-neutral-950 text-neutral-100">
          <DialogHeader>
            <DialogTitle style={{ color: "#f0d78c", fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.1em" }}>
              RECUPERAR ACCESO
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Escribe tu correo y te enviaremos un enlace para restablecer la contraseña. (Función próximamente en esta demo.)
            </DialogDescription>
          </DialogHeader>
          <Input placeholder="tu-correo@devi.com" className="border-[#c9a84c]/25 bg-black/50 text-neutral-100" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setForgotOpen(false)} className="text-neutral-300 hover:bg-neutral-800">Cerrar</Button>
            <Button
              onClick={() => setForgotOpen(false)}
              className="bg-[#c9a84c] text-neutral-900 hover:bg-[#e6c66a]"
            >
              Enviar enlace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
