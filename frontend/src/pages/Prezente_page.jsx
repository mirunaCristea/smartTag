
import "../components/Sidebar_component"


import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar_component";

/**
 * Paletă folosită (fără tailwind.config):
 * - Card:       #F7F9F6
 * - Border:     #E1E6E0
 * - Accent:     #4B7353 (verde muted, butoane/links)
 * - Hover:      #537E54
 * - Text:       #1F2937 (principal), #6B7280 (secundar)
 * - Eroare:     #EF4444
 */

// === Icons (inline, fără deps) ===
const Icon = ({ path, size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {path}
  </svg>
);
const Download = (p) => <Icon {...p} path={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>} />
const Refresh = (p) => <Icon {...p} path={<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></>} />
const Search = (p) => <Icon {...p} path={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} />

// === Utils ===
function cn(...xs){return xs.filter(Boolean).join(" ")}
const pad = (n)=>String(n).padStart(2,"0");
function fmtTime(ts){
  const d = new Date(ts);
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${h}:${m}:${s}`;
}

function useDebouncedValue(v, delay=300){
  const [deb,setDeb] = useState(v);
  useEffect(()=>{const t=setTimeout(()=>setDeb(v),delay); return()=>clearTimeout(t)},[v,delay]);
  return deb;
}

// === WebSocket config ===
/**
 * Variante suportate:
 * 1) WebSocket raw la ws[s]://host/ws/presence (mesaj: {time, nume, uid_hash, status})
 * 2) Dacă ai Socket.IO pe pagină (window.io), setează USE_SOCKET_IO=true și PATH="/socket.io" + event "presence".
 */
const USE_SOCKET_IO = false; // schimbă în true dacă ai Socket.IO client încărcat global
const WS_URL = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws/presence";
const SOCKET_IO_PATH = "/socket.io"; // doar dacă folosești Flask-SocketIO

export default function PrezenteLive(){
  const [rows,setRows] = useState([]); // {time, nume, uid_hash, status: "OK"|"Refuzat"}
  const [nameQ,setNameQ] = useState("");
  const [uidQ,setUidQ] = useState("");
  const nameDeb = useDebouncedValue(nameQ,250);
  const uidDeb = useDebouncedValue(uidQ,250);

  const socketRef = useRef(null);

  useEffect(()=>{
    let stop;
    if (USE_SOCKET_IO && window.io){
      const s = window.io({ path: SOCKET_IO_PATH, transports:["websocket"] });
      socketRef.current = s;
      const handler = (msg)=> {
        // msg: {time, nume, uid_hash, status}
        pushRow(msg);
      };
      s.on("presence", handler);
      s.on("connect_error", console.error);
      stop = () => { s.off("presence", handler); s.close(); };
    } else {
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;
      ws.onmessage = (ev)=>{
        try{
          const msg = JSON.parse(ev.data);
          pushRow(msg);
        }catch(e){ console.error("Invalid WS payload", e); }
      };
      ws.onerror = (e)=>console.error("WS error", e);
      stop = () => ws.close();
    }
    return stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  function pushRow(msg){
    const row = {
      time: msg.time ? msg.time : Date.now(),
      nume: msg.nume || "-",
      uid_hash: msg.uid_hash || "-",
      status: msg.status === true || msg.status === "OK" ? "OK" : "Refuzat",
    };
    setRows((xs)=> [row, ...xs].slice(0, 1000)); // păstrează ultimele 1000
  }

  function clearRows(){ setRows([]); }

  const filtered = useMemo(()=>{
    const nq = nameDeb.trim().toLowerCase();
    const uq = uidDeb.trim().toLowerCase();
    return rows.filter(r =>
      (!nq || (r.nume||"").toLowerCase().includes(nq)) &&
      (!uq || (r.uid_hash||"").toLowerCase().includes(uq))
    );
  },[rows,nameDeb,uidDeb]);

  // === Export ===
  function exportCSV(){
    const header = ["Ora","Nume","UID","Status"];
    const lines = filtered.map(r => [fmtTime(r.time), r.nume, r.uid_hash, r.status]);
    const csv = [header, ...lines].map(row => row.map(cell => {
      const v = String(cell ?? "");
      return /[",\n]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v;
    }).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `prezente_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function exportExcel(){
    // export rapid ca "Excel" (HTML table) — deschide în Excel/LibreOffice
    const header = ["Ora","Nume","UID","Status"];
    const rowsHtml = filtered.map(r => `<tr><td>${fmtTime(r.time)}</td><td>${escapeHtml(r.nume)}</td><td>${escapeHtml(r.uid_hash)}</td><td>${escapeHtml(r.status)}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table>${
      `<thead><tr>${header.map(h=>`<th>${h}</th>`).join("")}</tr></thead>`
    }<tbody>${rowsHtml}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `prezente_${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
  function escapeHtml(s){return String(s??"").replace(/[&<>\"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 w-full px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-[#1F2937]">Prezențe Live</h2>
            <p className="text-sm text-[#6B7280]">Actualizare în timp real din cititorul RFID.</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-xl border border-[#E1E6E0] px-4 py-2 text-sm text-[#1F2937] hover:bg-[#F7F9F6]">
              <Download size={16}/> Export CSV
            </button>
            <button onClick={exportExcel} className="inline-flex items-center gap-2 rounded-xl bg-[#4B7353] px-4 py-2 text-sm text-white hover:bg-[#537E54]">
              <Download size={16}/> Export Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={nameQ}
              onChange={(e)=>setNameQ(e.target.value)}
              placeholder="Caută după nume…"
              className="w-full rounded-2xl border border-[#E1E6E0] bg-white pl-9 pr-3 py-2 outline-none focus:border-[#4B7353]"
            />
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={uidQ}
              onChange={(e)=>setUidQ(e.target.value)}
              placeholder="Caută după UID…"
              className="w-full rounded-2xl border border-[#E1E6E0] bg-white pl-9 pr-3 py-2 outline-none focus:border-[#4B7353]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full rounded-2xl border border-[#E1E6E0] bg-[#F7F9F6] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white text-[#6B7280]">
                <tr className="text-left">
                  <th className="px-4 py-3">Ora</th>
                  <th className="px-4 py-3">Nume</th>
                  <th className="px-4 py-3">UID criptat</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-[#6B7280]">În așteptare evenimente…</td>
                  </tr>
                )}
                {filtered.map((r,idx)=> (
                  <tr key={idx} className="border-t border-[#E1E6E0] bg-white">
                    <td className="px-4 py-2 text-[#1F2937] whitespace-nowrap">{fmtTime(r.time)}</td>
                    <td className="px-4 py-2 text-[#1F2937]">{r.nume}</td>
                    <td className="px-4 py-2 font-mono text-[#1F2937]">{r.uid_hash}</td>
                    <td className="px-4 py-2">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs border",
                        r.status === "OK"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      )}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={clearRows} className="text-sm text-[#6B7280] hover:underline">curăță listă</button>
        </div>
      </main>
    </div>
  );
}
