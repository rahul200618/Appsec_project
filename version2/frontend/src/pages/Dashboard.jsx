import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorMessage, getUser, logout } from "../api";
import CategoryChart from "../components/CategoryChart.jsx";
import ExpenseModal from "../components/ExpenseModal.jsx";
import { colorFor, money } from "../categories";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | "new" | expense object
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
    const byCat = {};
    expenses.forEach((e) => (byCat[e.category] = (byCat[e.category] || 0) + e.amount));
    const chart = Object.entries(byCat)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return { monthTotal, monthCount: thisMonth.length, chart, allTotal: expenses.reduce((s, e) => s + e.amount, 0) };
  }, [expenses]);

  const monthName = new Date().toLocaleString("en-IN", { month: "long" });

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16">
      <header className="flex items-center justify-between py-6">
        <span className="font-display text-xl font-bold tracking-tight">Khata</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-ink-soft sm:inline">{user?.name}</span>
          <button onClick={signOut} className="rounded-lg border border-rule px-3 py-1.5 font-semibold hover:bg-rule/60">
            Log out
          </button>
        </div>
      </header>

      <section className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-ink pb-6">
        <div>
          <p className="text-sm text-ink-soft">Spent in {monthName}</p>
          <p className="font-display text-6xl font-bold leading-none tracking-tight tabular-nums sm:text-7xl">
            {money(stats.monthTotal)}
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            {stats.monthCount} {stats.monthCount === 1 ? "entry" : "entries"} this month · {money(stats.allTotal)} all time
          </p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="rounded-lg bg-saffron px-5 py-3 font-semibold text-ink transition-colors hover:brightness-95"
        >
          Add expense
        </button>
      </section>

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section aria-label="Expenses" className="overflow-hidden rounded-xl border border-rule bg-sheet">
          {loading ? (
            <p className="p-8 text-sm text-ink-soft">Loading your ledger…</p>
          ) : expenses.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-display text-xl font-bold">Your ledger is empty</p>
              <p className="mt-1 text-sm text-ink-soft">Add your first expense to start tracking.</p>
              <button onClick={() => setModal("new")} className="mt-5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper">
                Add expense
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-rule text-ink-soft">
                  <tr>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Expense</th>
                    <th className="px-3 py-3 font-medium">Category</th>
                    <th className="px-3 py-3 text-right font-medium">Amount</th>
                    <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e._id} className="border-b border-rule/70 last:border-0">
                      <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-ink-soft">
                        {new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="font-medium">{e.title}</div>
                        {e.notes && <div className="max-w-xs truncate text-xs text-ink-soft">{e.notes}</div>}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: colorFor(e.category) }} />
                          {e.category}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right font-semibold tabular-nums">{money(e.amount)}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <button onClick={() => setModal(e)} className="mr-3 font-semibold text-teal hover:underline">
                          Edit
                        </button>
                        <button onClick={() => remove(e)} className="font-semibold text-danger hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside aria-label="Spending by category" className="h-fit rounded-xl border border-rule bg-sheet p-5">
          <h2 className="font-display text-lg font-bold">By category</h2>
          <div className="mt-3">
            <CategoryChart data={stats.chart} />
          </div>
        </aside>
      </div>

      {modal && <ExpenseModal expense={modal === "new" ? null : modal} onClose={closeModal} onSave={save} />}
    </div>
  );
}
