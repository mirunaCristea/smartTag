import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Search, ChevronUp, ChevronDown, RefreshCcw } from "lucide-react";
import Sidebar from "../components/Sidebar_component";
// --- Helpers ---
function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function formatUID(uid) {
  if (!uid) return "-";
  if (uid.length <= 12) return uid;
  return uid.slice(0, 6) + "…" + uid.slice(-6);
}

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// --- API layer (adjust BASE as needed) ---
const API_BASE = "/api"; // e.g. behind Nginx: /api
async function apiListStudents(signal) {
  const r = await fetch(`${API_BASE}/students`, { signal });
  if (!r.ok) throw new Error(`List failed: ${r.status}`);
  return r.json();
}
async function apiCreateStudent(payload) {
  const r = await fetch(`${API_BASE}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiUpdateStudent(id, payload) {
  const r = await fetch(`${API_BASE}/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiDeleteStudent(id) {
  const r = await fetch(`${API_BASE}/students/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// --- Modal primitives ---
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-[#E1E6E0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E1E6E0] px-5 py-3">
          <h3 className="text-lg font-semibold text-[#1F2937]">{title}</h3>
          <button className="p-1 rounded-lg hover:bg-[#F7F9F6]" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
    </div>
  </div>
  );
}

function ConfirmDialog({ open, title = "Ești sigur?", message, confirmText = "Șterge", onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-[#1F2937] mb-5">{message}</p>
      <div className="flex items-center justify-end gap-2">
        <button onClick={onCancel} className="rounded-xl px-4 py-2 border border-[#E1E6E0] text-[#1F2937] hover:bg-[#F7F9F6]">Anulează</button>
        <button onClick={onConfirm} className="rounded-xl px-4 py-2 bg-[#EF4444] text-white hover:opacity-90">{confirmText}</button>
      </div>
    </Modal>
  );
}

// --- Student Form ---
function StudentForm({ initial, onSubmit, submitting }) {
  const [nume, setNume] = useState(initial?.nume ?? "");
  const [uid_hash, setUid] = useState(initial?.uid_hash ?? "");
  const [acces, setAcces] = useState(initial?.acces ?? true);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!nume.trim()) e.nume = "Numele este obligatoriu";
    if (!uid_hash.trim()) e.uid_hash = "UID criptat este obligatoriu";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ nume: nume.trim(), uid_hash: uid_hash.trim(), acces: !!acces });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-[#6B7280] mb-1">Nume</label>
        <input
          className={cn(
            "w-full rounded-xl border px-3 py-2 outline-none",
            errors.nume ? "border-[#EF4444]" : "border-[#E1E6E0] focus:border-[#4B7353]",
            "bg-white"
          )}
          value={nume}
          onChange={(e) => setNume(e.target.value)}
          placeholder="Ex: Ana Pop"
        />
        {errors.nume && <p className="text-xs text-[#EF4444] mt-1">{errors.nume}</p>}
      </div>
      <div>
        <label className="block text-sm text-[#6B7280] mb-1">UID criptat</label>
        <input
          className={cn(
            "w-full rounded-xl border px-3 py-2 outline-none",
            errors.uid_hash ? "border-[#EF4444]" : "border-[#E1E6E0] focus:border-[#4B7353]",
            "bg-white font-mono"
          )}
          value={uid_hash}
          onChange={(e) => setUid(e.target.value)}
          placeholder="sha256:..."
        />
        {errors.uid_hash && <p className="text-xs text-[#EF4444] mt-1">{errors.uid_hash}</p>}
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={acces} onChange={(e) => setAcces(e.target.checked)} />
        <span className="text-sm text-[#1F2937]">Acces permis</span>
      </label>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="submit" disabled={submitting} className={cn(
          "rounded-xl px-4 py-2 text-white",
          submitting ? "bg-[#4B7353]/60" : "bg-[#4B7353] hover:bg-[#537E54]"
        )}>
          {submitting ? "Se salvează…" : "Salvează"}
        </button>
      </div>
    </form>
  );
}

// --- Main Page ---
export default function StudentsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const [sortBy, setSortBy] = useState({ key: "nume", dir: "asc" });

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  // Fetch list
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");
    apiListStudents(ctrl.signal)
      .then((data) => setItems(data || []))
      .catch((e) => setError(e.message || "Eroare la încărcare"))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  function refresh() {
    setLoading(true);
    setError("");
    apiListStudents()
      .then((data) => setItems(data || []))
      .catch((e) => setError(e.message || "Eroare la încărcare"))
      .finally(() => setLoading(false));
  }

  // Derived list (search + sort)
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let arr = [...items];
    if (q) {
      arr = arr.filter((s) =>
        (s.nume || "").toLowerCase().includes(q) ||
        (s.uid_hash || "").toLowerCase().includes(q) ||
        String(s.acces).toLowerCase().includes(q)
      );
    }
    const { key, dir } = sortBy;
    arr.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return dir === "asc" ? -1 : 1;
      if (bv == null) return dir === "asc" ? 1 : -1;
      if (typeof av === "string" && typeof bv === "string") {
        return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return dir === "asc" ? (av > bv ? 1 : av < bv ? -1 : 0) : (av < bv ? 1 : av > bv ? -1 : 0);
    });
    return arr;
  }, [items, debouncedQuery, sortBy]);

  function toggleSort(key) {
    setSortBy((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  }

  // CRUD handlers
  async function handleCreate(payload) {
    try {
      setSubmitting(true);
      const created = await apiCreateStudent(payload);
      setItems((xs) => [created, ...xs]);
      setAddOpen(false);
    } catch (e) {
      alert(e.message || "Nu s-a putut crea studentul");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(payload) {
    try {
      setSubmitting(true);
      const upd = await apiUpdateStudent(editing.id, payload);
      setItems((xs) => xs.map((x) => (x.id === editing.id ? upd : x)));
      setEditOpen(false);
      setEditing(null);
    } catch (e) {
      alert(e.message || "Nu s-a putut edita");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      await apiDeleteStudent(toDelete.id);
      setItems((xs) => xs.filter((x) => x.id !== toDelete.id));
      setConfirmOpen(false);
      setToDelete(null);
    } catch (e) {
      alert(e.message || "Nu s-a putut șterge");
    }
  }

  async function handleToggleAccess(s) {
    try {
      const upd = await apiUpdateStudent(s.id, { ...s, acces: !s.acces });
      setItems((xs) => xs.map((x) => (x.id === s.id ? upd : x)));
    } catch (e) {
      alert("Nu am putut actualiza accesul");
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 w-full px-8 py-6 space-y-6 bg-white">
        {/* Header */}

        
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-[#1F2937]">Studenți</h2>
          <p className="text-sm text-[#6B7280]">Gestionează lista: adaugă, editează, caută, sortează.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="inline-flex items-center gap-2 rounded-xl border border-[#E1E6E0] px-3 py-2 text-sm text-[#1F2937] hover:bg-[#F7F9F6]">
            <RefreshCcw size={16} /> Reîncarcă
          </button>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#4B7353] px-3 py-2 text-sm text-white hover:bg-[#537E54]">
            <Plus size={16} /> Adaugă student
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută după nume, UID sau status…"
            className="w-full rounded-2xl border border-[#E1E6E0] bg-white pl-9 pr-3 py-2 outline-none focus:border-[#4B7353]"
          />
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-[#E1E6E0] bg-[#F7F9F6] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white">
              <tr className="text-left text-[#6B7280]">
                <Th label="Nume" activeKey={sortBy.key} dir={sortBy.dir} k="nume" onClick={toggleSort} />
                <Th label="UID criptat" activeKey={sortBy.key} dir={sortBy.dir} k="uid_hash" onClick={toggleSort} />
                <Th label="Acces" activeKey={sortBy.key} dir={sortBy.dir} k="acces" onClick={toggleSort} />
                <th className="px-4 py-3 text-right pr-5">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[#6B7280]">Se încarcă…</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[#EF4444]">{error}</td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[#6B7280]">Nimic de afișat.</td>
                </tr>
              )}
              {!loading && !error && filtered.map((s) => (
                <tr key={s.id} className="border-t border-[#E1E6E0] bg-white hover:bg-[#F7F9F6]">
                  <td className="px-4 py-3 text-[#1F2937]">{s.nume}</td>
                  <td className="px-4 py-3 font-mono text-[#1F2937]">{formatUID(s.uid_hash)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleAccess(s)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs",
                        s.acces
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      )}
                    >
                      {s.acces ? <Check size={14} /> : <X size={14} />}
                      {s.acces ? "Da" : "Nu"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 pr-1">
                      <button
                        onClick={() => { setEditing(s); setEditOpen(true); }}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#E1E6E0] px-3 py-1.5 text-xs text-[#1F2937] hover:bg-[#F7F9F6]"
                      >
                        <Pencil size={14} /> Editează
                      </button>
                      <button
                        onClick={() => { setToDelete(s); setConfirmOpen(true); }}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-white bg-[#EF4444] hover:opacity-90"
                      >
                        <Trash2 size={14} /> Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    
    
      {/* Add */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Adaugă student">
        <StudentForm onSubmit={handleCreate} submitting={submitting} />
      </Modal>

      {/* Edit */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editează student">
        {editing && <StudentForm initial={editing} onSubmit={handleEdit} submitting={submitting} />}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmOpen}
        message={toDelete ? `Ștergi studentul \"${toDelete.nume}\"?` : ""}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
    </main>
    
    </div>


  );
}

function Th({ label, k, activeKey, dir, onClick }) {
  const active = activeKey === k;
  return (
    <th>
      <button
        className={cn(
          "px-4 py-3 flex items-center gap-1.5 hover:underline underline-offset-4",
          active ? "text-[#1F2937]" : "text-[#6B7280]"
        )}
        onClick={() => onClick(k)}
      >
        <span>{label}</span>
        {active && (dir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      </button>
    </th>
  );
}
