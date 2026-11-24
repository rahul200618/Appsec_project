import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage, saveSession } from "../api";

export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-lg border border-rule bg-sheet px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-teal";

  return (
    <div className="grid min-h-full lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between bg-ink p-12 text-paper lg:flex">
        <div className="font-display text-2xl font-bold tracking-tight">Khata</div>
        <div>
          <p className="font-display text-5xl font-bold leading-[1.05] tracking-tight">
            Every rupee
            <br />
            written down.
          </p>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-paper/70">
            A private ledger for your spending. Only you can see the entries you add.
          </p>
        </div>
        <div className="h-1.5 w-24 rounded-full bg-saffron" />
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-sm" noValidate>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {isRegister ? "Open your ledger" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {isRegister ? "Create an account to start tracking expenses." : "Log in to see your expenses."}
          </p>

          <div className="mt-8 space-y-4">
            {isRegister && (
              <label className="block text-sm font-medium">
                Name
                <input className={`${input} mt-1.5`} value={form.name} onChange={set("name")} autoComplete="name" required />
              </label>
            )}
            <label className="block text-sm font-medium">
              Email
              <input className={`${input} mt-1.5`} type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                className={`${input} mt-1.5`}
                type="password"
                value={form.password}
                onChange={set("password")}
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
              />
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-lg bg-ink py-2.5 font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
          >
            {busy ? "Please wait…" : isRegister ? "Create account" : "Log in"}
          </button>

          <p className="mt-6 text-sm text-ink-soft">
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <Link className="font-semibold text-teal underline-offset-4 hover:underline" to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Log in" : "Create an account"}
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
