import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Lock, Virus } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@globalhantamap.org");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/admin");
    } catch (err) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-0 p-4">
      <form
        data-testid="admin-login-form"
        onSubmit={submit}
        className="w-full max-w-md border border-ink-3 bg-ink-1 p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 grid place-items-center bg-signal-red rounded-sm">
            <Virus size={22} weight="duotone" />
          </div>
          <div>
            <div className="font-display font-black tracking-tight">
              GLOBAL HANTA MAP
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Admin Console
            </div>
          </div>
        </div>
        <h1 className="font-display font-black text-2xl mb-1">
          Sign in
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          Restricted area for outbreak editors and moderators.
        </p>
        <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
          Email
        </label>
        <input
          data-testid="admin-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          className="w-full mb-4 px-3 py-2.5 bg-ink-0 border border-ink-3 outline-none focus:border-white/30 text-sm"
        />
        <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
          Password
        </label>
        <input
          data-testid="admin-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          className="w-full mb-6 px-3 py-2.5 bg-ink-0 border border-ink-3 outline-none focus:border-white/30 text-sm"
        />
        <button
          data-testid="admin-login-btn"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-signal-red hover:bg-[#D32F2F] text-white font-mono text-xs uppercase tracking-[0.2em] rounded-sm disabled:opacity-50"
        >
          <Lock size={14} weight="bold" /> {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
