// src/lib/api.js
const API = "/api/v1";

async function req(path, opts = {}) {
  const r = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status} ${r.statusText} - ${text}`);
  }
  // 204 no content?
  if (r.status === 204) return null;
  return r.json();
}

export const api = {
  health: () => req(`/sanatate`),

  // prezente = evenimente brute (RFID taps)
  prezente: (limit = 50) => req(`/prezente?limit=${limit}`),
  unknown: (limit = 10) => req(`/prezente/unknown?limit=${limit}`),
//   // (opțional) asignează ulterior un eveniment unknown la un student
//   assignStudent: (id, student_id) =>
//     req(`/prezente/${id}/assign-student`, {
//       method: "POST",
//       body: JSON.stringify({ student_id }),
//     }),

  // students (dacă vrei numele în feed)
//   students: (limit = 1000, q = "") =>
//     req(`/studenti?limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ""}`),

  // util: export CSV din ce ai deja în memorie (nu lovește serverul)
  exportPrezenteCsv: (rows) => {
    const headers = ["id", "timestamp", "student_id", "uid_hash", "status"];
    const lines = [headers.join(",")].concat(
      rows.map((e) =>
        [
          e.id ?? "",
          (e.timestamp || e.ts || "").toString(),
          e.student_id ?? "",
          e.uid_hash ?? "",
          e.status ?? "",
        ]
          .map((x) => `"${String(x).replace(/"/g, '""')}"`)
          .join(",")
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `prezente_${new Date().toISOString().slice(0, 19)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
};
