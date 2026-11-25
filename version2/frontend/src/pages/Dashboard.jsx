import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage, getUser, logout } from "../api";
import CategoryChart from "../components/CategoryChart.jsx";
import ExpenseModal from "../components/ExpenseModal.jsx";
import { CATEGORIES, colorFor, money } from "../categories";
import {
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "../components/Icons.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | "new" | expense object
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const closeModal = useCallback(() => setModal(null), []);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/expenses");
      setExpenses(data);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(payload) {
    try {
      if (modal && modal !== "new") await api.put(`/expenses/${modal._id}`, payload);
      else await api.post("/expenses", payload);
    } catch (err) {
      throw errorMessage(err);
    }
    setModal(null);
    load();
  }

  async function remove(exp) {
    if (!window.confirm(`Delete "${exp.title}"?`)) return;
    try {
      await api.delete(`/expenses/${exp._id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function signOut() {
    logout();
    navigate("/login");
  }

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthTotal = thisMonth.reduce((s, e) => s + e.amount, 0);
    const allTotal = expenses.reduce((s, e) => s + e.amount, 0);
    const byCat = {};
    expenses.forEach((e) => (byCat[e.category] = (byCat[e.category] || 0) + e.amount));
    const chart = Object.entries(byCat)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const topCategory = chart[0] || null;
    const avgEntry = expenses.length ? allTotal / expenses.length : 0;
    return {
      monthTotal,
      monthCount: thisMonth.length,
      chart,
      allTotal,
      topCategory,
      avgEntry,
    };
  }, [expenses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter((e) => {
      const catMatch = activeCategory === "All" || e.category === activeCategory;
      const textMatch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q));
      return catMatch && textMatch;
    });
  }, [expenses, activeCategory, query]);

  const monthName = new Date().toLocaleString("en-IN", { month: "long" });
  const initials = (user?.name || "U").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-paper">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-rule bg-sheet/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/welcome" className="flex items-center gap-2.5 cursor-pointer">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-amber-400">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-ink">Khata</span>
            </Link>
            <span className="hidden rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal sm:inline-block">
              v2.0 Protected
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="hidden items-center gap-2 rounded-full border border-rule bg-paper px-3 py-1 sm:flex">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper">
                {initials}
              </span>
              <span className="font-medium text-ink">{user?.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setModal("new")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-saffron px-3.5 py-2 text-xs font-bold text-ink transition-colors hover:brightness-95 cursor-pointer sm:text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add expense</span>
            </button>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-sheet px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-paper hover:text-ink cursor-pointer sm:text-sm"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        {/* Bento KPI Summary Cards */}
        <section aria-label="Spending summary" className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-rule bg-ink p-6 text-slate-50 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Spent in {monthName}
            </p>
            <p className="mt-2 font-display text-4xl font-bold tracking-tight tabular-nums text-white sm:text-5xl">
              {money(stats.monthTotal)}
            </p>
            <p className="mt-3 text-xs text-slate-300">
              {stats.monthCount} {stats.monthCount === 1 ? "entry" : "entries"} recorded this month
            </p>
          </div>

          <div className="rounded-2xl border border-rule bg-sheet p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              All-Time Ledger
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight tabular-nums text-ink sm:text-4xl">
              {money(stats.allTotal)}
            </p>
            <p className="mt-3 text-xs text-ink-soft">
              {expenses.length} total entries · Avg {money(stats.avgEntry)} / entry
            </p>
          </div>

          <div className="rounded-2xl border border-rule bg-sheet p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Top Spending Category
            </p>
            {stats.topCategory ? (
              <>
                <div className="mt-2 flex items-center gap-2.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ background: colorFor(stats.topCategory.name) }}
                  />
                  <p className="font-display text-3xl font-bold tracking-tight text-ink">
                    {stats.topCategory.name}
                  </p>
                </div>
                <p className="mt-3 text-xs text-ink-soft tabular-nums">
                  {money(stats.topCategory.value)} (
                  {stats.allTotal > 0
                    ? Math.round((stats.topCategory.value / stats.allTotal) * 100)
                    : 0}
                  % of total spend)
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">No expenses recorded yet.</p>
            )}
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}

        {/* Search & Category Filter Controls */}
        <section className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", ...CATEGORIES.map((c) => c.name)].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "bg-ink text-paper"
                    : "border border-rule bg-sheet text-ink-soft hover:bg-paper hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              placeholder="Search expenses…"
              aria-label="Search expenses"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-rule bg-sheet py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-teal"
            />
          </div>
        </section>

        {/* Main Table + Chart Layout */}
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section
            aria-label="Expenses"
            className="overflow-hidden rounded-2xl border border-rule bg-sheet shadow-xs"
          >
            {loading ? (
              <p className="p-10 text-center text-sm text-ink-soft">Loading your ledger…</p>
            ) : expenses.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-display text-xl font-bold">Your ledger is empty</p>
                <p className="mt-1 text-sm text-ink-soft">
                  Add your first expense to start tracking.
                </p>
                <button
                  type="button"
                  onClick={() => setModal("new")}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink/90 cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add expense
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-display text-lg font-bold">No matching entries</p>
                <p className="mt-1 text-sm text-ink-soft">
                  Try clearing your search or selecting &ldquo;All&rdquo;.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead className="border-b border-rule bg-paper/60 text-xs uppercase tracking-wider text-ink-soft">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Date</th>
                      <th className="px-3 py-3.5 font-semibold">Expense</th>
                      <th className="px-3 py-3.5 font-semibold">Category</th>
                      <th className="px-3 py-3.5 text-right font-semibold">Amount</th>
                      <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => (
                      <tr
                        key={e._id}
                        className="border-b border-rule/70 transition-colors last:border-0 hover:bg-paper/50"
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-ink-soft">
                          {new Date(e.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="font-semibold text-ink">{e.title}</div>
                          {e.notes && (
                            <div className="max-w-xs truncate text-xs text-ink-soft">{e.notes}</div>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-2.5 py-0.5 text-xs font-medium">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: colorFor(e.category) }}
                            />
                            {e.category}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right font-bold tabular-nums text-ink">
                          {money(e.amount)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setModal(e)}
                              aria-label={`Edit ${e.title}`}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-teal transition-colors hover:bg-teal/10 cursor-pointer"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(e)}
                              aria-label={`Delete ${e.title}`}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-danger transition-colors hover:bg-danger/10 cursor-pointer"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside
            aria-label="Spending by category"
            className="h-fit rounded-2xl border border-rule bg-sheet p-5 shadow-xs"
          >
            <h2 className="font-display text-lg font-bold">By category</h2>
            <p className="mt-0.5 text-xs text-ink-soft">Distribution across all entries</p>
            <div className="mt-4">
              <CategoryChart data={stats.chart} />
            </div>
          </aside>
        </div>
      </main>

      {modal && (
        <ExpenseModal
          expense={modal === "new" ? null : modal}
          onClose={closeModal}
          onSave={save}
        />
      )}
    </div>
  );
}
