import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Ledger3DScene from "../components/Ledger3DScene.jsx";
import TiltCard3D from "../components/TiltCard3D.jsx";
import { CATEGORIES, colorFor, money } from "../categories";
import { isLoggedIn } from "../api";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  KeyIcon,
  LayersIcon,
  LockIcon,
  PlusIcon,
  ServerIcon,
  ShieldCheckIcon,
} from "../components/Icons.jsx";

const SEED_ENTRIES = [
  { id: 1, title: "South Indian Filter Coffee", category: "Food", amount: 180 },
  { id: 2, title: "Namma Metro Smart Card", category: "Transport", amount: 650 },
  { id: 3, title: "Fiber Internet Bill", category: "Utilities", amount: 999 },
];

const QUICK_PRESETS = [
  { title: "Team Lunch", category: "Food", amount: 740 },
  { title: "Cab to Campus", category: "Transport", amount: 320 },
  { title: "Lab Books", category: "Shopping", amount: 1250 },
];

const SECURITY_PILLARS = [
  {
    icon: ShieldCheckIcon,
    badge: "OWASP ZAP Clean",
    title: "Helmet & Strict CSP",
    desc: "Strict Content-Security-Policy, DENY frameguard, nosniff, and zero third-party font/script leaks.",
  },
  {
    icon: KeyIcon,
    badge: "Semgrep & TruffleHog Clean",
    title: "Zero Fallback Secrets",
    desc: "HS256 JWT signing strictly requires a 32+ char runtime secret from environment variables.",
  },
  {
    icon: LockIcon,
    badge: "IDOR / BOLA Guarded",
    title: "Ownership Enforcement",
    desc: "Every read, edit, and delete is scoped by createdBy: req.user.id with ObjectId validation.",
  },
  {
    icon: LayersIcon,
    badge: "Mass-Assignment Safe",
    title: "Strict Allowlist Validation",
    desc: "Only allowlisted fields reach MongoDB; $ne operators are neutralized with sanitizeFilter.",
  },
  {
    icon: ServerIcon,
    badge: "Zero Stack Traces",
    title: "Central Error Handling",
    desc: "Internal stack traces stay strictly in server logs while clients receive clean status messages.",
  },
  {
    icon: CheckCircleIcon,
    badge: "Brute-Force Shield",
    title: "Rate Limit & Bcrypt 12",
    desc: "Login and registration endpoints enforce rate limits and constant-time password hashing.",
  },
];

export default function Landing() {
  const authed = isLoggedIn();
  const [heroMode, setHeroMode] = useState("ledger"); // "ledger" | "shield"
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [draft, setDraft] = useState({ title: "", amount: "", category: "Food" });
  const [injectAdminField, setInjectAdminField] = useState(true);

  const summary = useMemo(() => {
    const total = entries.reduce((sum, item) => sum + item.amount, 0);
    const byCategory = {};
    entries.forEach((item) => {
      byCategory[item.category] = (byCategory[item.category] || 0) + item.amount;
    });
    const breakdown = Object.entries(byCategory)
      .map(([name, value]) => ({
        name,
        value,
        pct: total > 0 ? Math.round((value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
    return { total, breakdown };
  }, [entries]);

  function addPreset(preset) {
    setEntries((prev) => [
      { id: Date.now() + Math.random(), ...preset },
      ...prev.slice(0, 5),
    ]);
  }

  function handleSandboxSubmit(e) {
    e.preventDefault();
    const numeric = Number(draft.amount);
    if (!draft.title.trim() || !Number.isFinite(numeric) || numeric <= 0) return;
    addPreset({
      title: draft.title.trim().slice(0, 60),
      category: draft.category,
      amount: Math.round(numeric * 100) / 100,
    });
    setDraft({ title: "", amount: "", category: draft.category });
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Immersive 3D Hero Section */}
      <section className="hero-mesh relative overflow-hidden text-slate-50">
        {/* 3D Interactive Canvas Backdrop */}
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <Ledger3DScene />
        </div>

        {/* Floating Glassmorphic Navbar */}
        <header className="relative z-20 mx-auto max-w-6xl px-4 pt-5 sm:px-6">
          <nav
            aria-label="Primary navigation"
            className="flex items-center justify-between rounded-2xl border border-white/12 bg-slate-950/65 px-5 py-3 shadow-lg backdrop-blur-md"
          >
            <Link to="/welcome" className="flex items-center gap-2.5 cursor-pointer">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-white">Khata</span>
              <span className="hidden rounded-full border border-teal-400/30 bg-teal-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300 sm:inline-block">
                v2.0 Secure
              </span>
            </Link>

            <div className="hidden items-center gap-7 text-sm font-medium text-slate-300 md:flex">
              <a href="#interactive-3d" className="transition-colors hover:text-white">
                3D Vault
              </a>
              <a href="#sandbox" className="transition-colors hover:text-white">
                Live Sandbox
              </a>
              <a href="#security" className="transition-colors hover:text-white">
                Security Architecture
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              {authed ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 cursor-pointer"
                >
                  Dashboard
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 cursor-pointer"
                  >
                    Get Started
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Copy + 3D Interactive Vault Card */}
        <div
          id="interactive-3d"
          className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-amber-300">
              <LockIcon className="h-3.5 w-3.5" />
              <span>ZERO-TRUST PERSONAL EXPENSE LEDGER · V2.0</span>
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Every rupee tracked.
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-teal-300 bg-clip-text text-transparent">
                Armored in 3D space.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Move your cursor across the 3D holographic ledger vault or click quick expenses to watch
              real-time categorization, strict allowlist validation, and ownership-scoped isolation in action.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to={authed ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400 cursor-pointer"
              >
                {authed ? "Open Your Ledger" : "Create Free Account"}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href="#sandbox"
                className="inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 cursor-pointer"
              >
                Try Interactive Sandbox
              </a>
            </div>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs">
              <div>
                <p className="font-display text-2xl font-bold text-white">0</p>
                <p className="mt-0.5 text-slate-400">Semgrep Findings</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-teal-300">0</p>
                <p className="mt-0.5 text-slate-400">ZAP Security Alerts</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-amber-300">0</p>
                <p className="mt-0.5 text-slate-400">Leaked Secrets</p>
              </div>
            </div>
          </div>

          {/* 3D Interactive Perspective Card */}
          <div className="relative mx-auto w-full max-w-md">
            <TiltCard3D className="rounded-3xl border border-white/15 bg-slate-900/85 p-6 shadow-2xl backdrop-blur-xl">
              {/* Top Floating 3D Layer */}
              <div className="translate-z-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-300">
                    Interactive 3D Preview
                  </p>
                  <p className="font-display text-lg font-bold text-white">Khata Vault #02</p>
                </div>

                <div className="flex rounded-lg border border-white/10 bg-slate-950/80 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setHeroMode("ledger")}
                    className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                      heroMode === "ledger"
                        ? "bg-amber-500 text-slate-950"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Ledger
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroMode("shield")}
                    className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                      heroMode === "shield"
                        ? "bg-teal-500 text-slate-950"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Security
                  </button>
                </div>
              </div>

              {heroMode === "ledger" ? (
                <div className="translate-z-12 mt-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Live Sandbox Spend</p>
                      <p className="mt-1 font-display text-4xl font-bold tabular-nums text-white">
                        {money(summary.total)}
                      </p>
                    </div>
                    <span className="rounded-full border border-teal-400/30 bg-teal-500/15 px-2.5 py-1 text-[11px] font-semibold text-teal-300">
                      {entries.length} entries
                    </span>
                  </div>

                  {/* Quick Interactive Presets */}
                  <div className="mt-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Click to simulate an entry
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {QUICK_PRESETS.map((preset) => (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => addPreset(preset)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-amber-400/50 hover:bg-amber-500/15 hover:text-amber-200 cursor-pointer"
                        >
                          <PlusIcon className="h-3 w-3 text-amber-400" />
                          <span>{preset.title}</span>
                          <span className="tabular-nums text-slate-400">{money(preset.amount)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Mini Feed */}
                  <ul className="mt-5 space-y-2">
                    {entries.slice(0, 3).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-white/8 bg-slate-950/60 px-3.5 py-2.5 text-sm"
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: colorFor(item.category) }}
                          />
                          <span className="truncate font-medium text-slate-100">{item.title}</span>
                        </span>
                        <span className="ml-3 shrink-0 font-semibold tabular-nums text-amber-300">
                          {money(item.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="translate-z-12 mt-5 space-y-3">
                  <div className="rounded-xl border border-teal-400/25 bg-teal-500/10 p-3.5">
                    <p className="text-xs font-semibold text-teal-300">JWT Auth Policy</p>
                    <p className="mt-1 font-mono text-xs text-slate-200">
                      alg: HS256 · exp: 1h · secret: env-only
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-3.5">
                    <p className="text-xs font-semibold text-amber-300">IDOR Protection</p>
                    <p className="mt-1 font-mono text-xs text-slate-200">
                      {"findOne({ _id, createdBy: req.user.id })"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-3.5">
                    <p className="text-xs font-semibold text-violet-300">CSP & Headers</p>
                    <p className="mt-1 font-mono text-xs text-slate-200">
                      default-src 'self' · frame-ancestors 'none'
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom 3D Depth Strip */}
              <div className="translate-z-16 mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/80 px-3.5 py-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-teal-300">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  In-memory session only
                </span>
                <span>Tilt cursor to inspect 3D</span>
              </div>
            </TiltCard3D>
          </div>
        </div>
      </section>

      {/* Interactive Live Sandbox & Payload Inspector */}
      <section id="sandbox" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal">
              Interactive Demonstration
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Test the Ledger & Input Allowlisting
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft sm:text-base">
              Add an expense below and toggle an injected <code className="rounded bg-rule/60 px-1.5 py-0.5 text-xs font-semibold">createdBy / role</code> payload
              to see how Version 2 strips unauthorized fields before saving.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Interactive Form + Live Category Breakdown */}
          <div className="rounded-2xl border border-rule bg-sheet p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold">Add Test Expense</h3>
            <form onSubmit={handleSandboxSubmit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_130px_130px_auto]">
              <input
                type="text"
                placeholder="Expense title (e.g. Books)"
                aria-label="Expense title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                maxLength={60}
                className="rounded-xl border border-rule bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-teal"
                required
              />
              <input
                type="number"
                placeholder="Amount ₹"
                aria-label="Amount"
                min="1"
                step="1"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                className="rounded-xl border border-rule bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-teal"
                required
              />
              <select
                aria-label="Category"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className="rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm outline-none focus:border-teal cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 cursor-pointer"
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">Category Distribution</span>
                <span className="font-display font-bold tabular-nums">{money(summary.total)}</span>
              </div>
              {summary.breakdown.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: colorFor(cat.name) }}
                      />
                      {cat.name}
                    </span>
                    <span className="tabular-nums text-ink-soft">
                      {money(cat.value)} ({cat.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${cat.pct}%`, background: colorFor(cat.name) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time v1 vs v2 Allowlist Inspector */}
          <div className="flex flex-col justify-between rounded-2xl border border-rule bg-ink p-6 text-slate-100 shadow-sm">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-white">
                  Backend Sanitization Inspector
                </h3>
                <button
                  type="button"
                  onClick={() => setInjectAdminField((v) => !v)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    injectAdminField
                      ? "border-amber-400/50 bg-amber-500/20 text-amber-200"
                      : "border-white/15 bg-white/5 text-slate-300"
                  }`}
                >
                  {injectAdminField ? "Simulated Attack Payload: ON" : "Simulated Attack Payload: OFF"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Version 2 validates types and drops unauthorized keys via <code className="text-teal-300">validateExpense()</code>.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                    Incoming Request Body
                  </p>
                  <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-slate-300">
{JSON.stringify(
  {
    title: draft.title.trim() || "Team Lunch",
    amount: Number(draft.amount) || 740,
    category: draft.category,
    ...(injectAdminField
      ? { createdBy: "victim_user_id", isAdmin: true }
      : {}),
  },
  null,
  2
)}
                  </pre>
                </div>

                <div className="rounded-xl border border-teal-400/30 bg-teal-950/30 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                    Saved in Version 2 DB
                  </p>
                  <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-teal-100">
{JSON.stringify(
  {
    title: draft.title.trim() || "Team Lunch",
    amount: Number(draft.amount) || 740,
    category: draft.category,
    createdBy: "req.user.id (JWT)",
  },
  null,
  2
)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
              <span>Mass Assignment & NoSQL Operator Injection Blocked</span>
              <Link
                to={authed ? "/dashboard" : "/register"}
                className="font-semibold text-amber-300 hover:underline cursor-pointer"
              >
                Open Real App →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture Grid */}
      <section id="security" className="border-t border-rule bg-sheet py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-teal">
              DevSecOps Hardened
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Built for Security Verification
            </h2>
            <p className="mt-2 text-sm text-ink-soft sm:text-base">
              Every vulnerability detected in the Version 1 baseline across Semgrep, OWASP ZAP,
              and TruffleHog has been remediated in Version 2.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECURITY_PILLARS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-rule bg-paper/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-teal/40 hover:bg-sheet hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-amber-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-teal/10 px-2.5 py-1 text-[11px] font-semibold text-teal">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rule bg-paper py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-ink-soft sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <ShieldCheckIcon className="h-4 w-4 text-teal" />
            <span>Khata Expense Ledger · Version 2.0</span>
          </div>
          <p>Synthetic test data only · Verified with Semgrep, TruffleHog & OWASP ZAP</p>
          <div className="flex gap-4 font-semibold">
            <Link to="/login" className="text-teal hover:underline cursor-pointer">
              Log in
            </Link>
            <Link to="/register" className="text-teal hover:underline cursor-pointer">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

