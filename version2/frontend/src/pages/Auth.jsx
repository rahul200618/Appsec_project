import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage, saveSession } from "../api";
import TiltCard3D from "../components/TiltCard3D.jsx";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldCheckIcon,
} from "../components/Icons.jsx";

export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const body = isRegister ? form : { email: form.email, password: form.password };
      const { data } = await api.post(`/auth/${isRegister ? "register" : "login"}`, body);
      saveSession(data);
      navigate("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-rule bg-paper/70 px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-teal focus:bg-sheet";

  return (
    <div className="grid min-h-full lg:grid-cols-[1.08fr_0.92fr]">
      {/* Left Interactive Security Showcase */}
      <aside className="hero-mesh relative hidden flex-col justify-between overflow-hidden p-12 text-slate-50 lg:flex">
        <div className="flex items-center justify-between">
          <Link to="/welcome" className="inline-flex items-center gap-2.5 cursor-pointer">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
              <ShieldCheckIcon className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-white">Khata</span>
          </Link>
          <Link
            to="/welcome"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 cursor-pointer"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="my-auto py-8">
          <p className="font-display text-5xl font-bold leading-[1.06] tracking-tight text-white">
            Every rupee
            <br />
            <span className="text-amber-400">written down.</span>
          </p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-300">
            Your ledger is isolated per account with bcrypt cost 12 hashing, HS256 short-lived
            tokens, and strict ownership verification.
          </p>

          <div className="mt-8 max-w-sm">
            <TiltCard3D className="rounded-2xl border border-white/15 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-teal-300">Active Security Posture</span>
                <span className="rounded-full bg-teal-500/15 px-2 py-0.5 font-semibold text-teal-300">
                  v2.0
                </span>
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-teal-400" />
                  <span>In-memory JWT session (zero localStorage exposure)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-teal-400" />
                  <span>Rate-limited login & timing-safe comparison</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-teal-400" />
                  <span>Strict CSP + Helmet + IDOR ownership scoping</span>
                </li>
              </ul>
            </TiltCard3D>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-1.5 w-20 rounded-full bg-amber-500" />
          <span className="text-xs text-slate-400">Synthetic test environment</span>
        </div>
      </aside>

      {/* Right Auth Form */}
      <main className="flex flex-col items-center justify-center bg-paper px-6 py-12">
        <div className="mb-6 flex w-full max-w-sm items-center justify-between lg:hidden">
          <Link to="/welcome" className="inline-flex items-center gap-2 font-display text-xl font-bold">
            <ShieldCheckIcon className="h-5 w-5 text-teal" />
            <span>Khata v2</span>
          </Link>
          <Link to="/welcome" className="text-xs font-semibold text-teal hover:underline">
            ← Home
          </Link>
        </div>

        <form
          onSubmit={submit}
          className="w-full max-w-sm rounded-2xl border border-rule bg-sheet p-7 shadow-sm"
          noValidate
        >
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {isRegister ? "Open your ledger" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {isRegister
              ? "Create an account to start tracking expenses. Password: 8 to 72 characters."
              : "Log in to access your private expense ledger."}
          </p>

          <div className="mt-7 space-y-4">
            {isRegister && (
              <label className="block text-sm font-medium">
                Full Name
                <input
                  className={`${input} mt-1.5`}
                  value={form.name}
                  onChange={set("name")}
                  autoComplete="name"
                  placeholder="e.g. Rahul Sharma"
                  maxLength={60}
                  required
                />
              </label>
            )}
            <label className="block text-sm font-medium">
              Email Address
              <input
                className={`${input} mt-1.5`}
                type="email"
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
                placeholder="you@example.com"
                maxLength={254}
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <div className="relative mt-1.5">
                <input
                  className={`${input} pr-10`}
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  minLength={isRegister ? 8 : undefined}
                  maxLength={72}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-soft hover:text-ink cursor-pointer"
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-60 cursor-pointer"
          >
            <span>{busy ? "Please wait…" : isRegister ? "Create account" : "Log in"}</span>
            {!busy && <ArrowRightIcon className="h-4 w-4" />}
          </button>

          <p className="mt-6 text-center text-sm text-ink-soft">
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <Link
              className="font-semibold text-teal underline-offset-4 hover:underline"
              to={isRegister ? "/login" : "/register"}
            >
              {isRegister ? "Log in" : "Create an account"}
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
