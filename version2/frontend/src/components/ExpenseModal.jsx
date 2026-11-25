import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "../categories";

const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseModal({ expense, onClose, onSave }) {
  const editing = Boolean(expense);
  const [form, setForm] = useState({
    title: expense?.title || "",
    amount: expense?.amount ?? "",
    category: expense?.category || "Food",
    date: expense?.date ? expense.date.slice(0, 10) : today(),
    notes: expense?.notes || "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const first = useRef(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSave({ ...form, amount: Number(form.amount) });
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  }

  const input =
    "mt-1.5 w-full rounded-xl border border-rule bg-sheet px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-teal";

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-xs sm:items-center"
      onMouseDown={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-rule bg-paper p-6 shadow-2xl"
      >
        <h2 id="modal-title" className="font-display text-2xl font-bold tracking-tight">
          {editing ? "Edit expense" : "Add new expense"}
        </h2>
        <p className="mt-1 text-xs text-ink-soft">
          All inputs are allowlisted and verified server-side.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium">
            What was it for?
            <input
              ref={first}
              className={input}
              placeholder="e.g. Groceries, Metro card"
              value={form.title}
              onChange={set("title")}
              maxLength={100}
              required
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">
              Amount (₹)
              <input
                className={input}
                type="number"
                min="0.01"
                max="1000000000"
                step="0.01"
                value={form.amount}
                onChange={set("amount")}
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Date
              <input
                className={input}
                type="date"
                value={form.date}
                onChange={set("date")}
                required
              />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Category
            <select
              className={`${input} cursor-pointer`}
              value={form.category}
              onChange={set("category")}
            >
              {CATEGORIES.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Notes
            <textarea
              className={input}
              rows={2}
              maxLength={500}
              placeholder="Optional description"
              value={form.notes}
              onChange={set("notes")}
            />
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

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-rule/60 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-60 cursor-pointer"
          >
            {busy ? "Saving…" : editing ? "Save changes" : "Add expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
