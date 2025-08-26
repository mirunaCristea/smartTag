import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar_component";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

/**
 * Paletă folosită (fără tailwind.config):
 * - Card:       #F7F9F6
 * - Border:     #E1E6E0
 * - Accent:     #4B7353 (verde muted, butoane/links)
 * - Hover:      #537E54
 * - Text:       #1F2937 (principal), #6B7280 (secundar)
 * - Eroare:     #EF4444
 */

// NOTE: Ai nevoie de `recharts` în deps (o singură librărie):
// npm install recharts

function cn(...xs){return xs.filter(Boolean).join(" ")}

// --- API helpers (ajustează după backend) ---
const API = "/api";
async function apiAttendanceRate(groupBy){
 // simulate network delay
  await new Promise(res => setTimeout(res, 300));
  return [
    { label: "2025-08-01", rate: 0.78 },
    { label: "2025-08-02", rate: 0.82 },
    { label: "2025-08-03", rate: 0.65 },
    { label: "2025-08-04", rate: 0.91 },
  ];
}
async function apiPerStudent(){
  await new Promise(res=>setTimeout(res,300))
  return [
    {
        nume: "Ana Pop", prezente: 45, procent: 50
    },
    {
        nume: "Ion Ionescu", prezente: 30, procent: 40
    },
    {
        nume: "Maria Georgescu", prezente: 20, procent: 30
    }
  ];
}
async function apiPerDiscipline(){
  await new Promise(res =>setTimeout(res,300))
  return [
    { disciplina: "BE", prezente: 120, total: 150 },
    { disciplina: "POO", prezente: 100, total: 130 },
    { disciplina: "PDS", prezente: 80, total: 100 },
  ];
}
async function apiTopPunctuality(limit=3){
  await new Promise(res => setTimeout(res,300))
  return [
    { nume: "Ana Pop", media_minute_early: 7.2 },
    { nume: "Ion Ionescu", media_minute_early: 5.5 },
    { nume: "Maria Georgescu", media_minute_early: 4.8 },
  ];
}

// fallback minimal dacă API-ul nu e gata
function useSafe(asyncFn, deps){
  const [data,setData]=useState(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{let ok=true; setLoading(true); setError("");
    asyncFn().then(d=>ok&&setData(d)).catch(e=>ok&&setError(e.message||"Eroare"))
    .finally(()=>ok&&setLoading(false));
    return()=>{ok=false}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return {data,error,loading,setData};
}

export default function Statistici(){
  const [groupBy, setGroupBy] = useState("day"); // "day" | "week"
  const att = useSafe(()=>apiAttendanceRate(groupBy), [groupBy]);
  const perStudent = useSafe(()=>apiPerStudent(), []);
  const perDisc = useSafe(()=>apiPerDiscipline(), []);
  const top = useSafe(()=>apiTopPunctuality(3), []);

  // calc rate % pt tooltips/labels
  const attData = useMemo(()=> (att.data||[]).map(d=>({ ...d, pct: Math.round((d.rate||0)*100) })), [att.data]);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-[#1F2937]">Statistici</h2>
            <p className="text-sm text-[#6B7280]">Evoluții + comparații prezențe</p>
          </div>
          <div className="inline-flex rounded-2xl border border-[#E1E6E0] overflow-hidden">
            <button
              className={cn("px-4 py-2 text-sm", groupBy==='day'?"bg-[#4B7353] text-white":"bg-white text-[#1F2937]")}
              onClick={()=>setGroupBy('day')}
            >Zile</button>
            <button
              className={cn("px-4 py-2 text-sm border-l border-[#E1E6E0]", groupBy==='week'?"bg-[#4B7353] text-white":"bg-white text-[#1F2937]")}
              onClick={()=>setGroupBy('week')}
            >Săptămâni</button>
          </div>
        </div>

        {/* 1) Rata prezențelor pe zile/săptămâni */}
        <section className="rounded-2xl border border-[#E1E6E0] bg-[#F7F9F6] p-4">
          <h3 className="text-[#1F2937] font-medium mb-3">Rata prezențelor ({groupBy==='day'? 'zilnic' : 'săptămânal'})</h3>
          {att.loading && <p className="text-[#6B7280] p-6">Se încarcă…</p>}
          {att.error && <p className="text-[#EF4444] p-6">{att.error}</p>}
          {!att.loading && !att.error && (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attData} margin={{ left: 8, right: 16, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{fill:'#6B7280'}} />
                  <YAxis domain={[0, 1]} tickFormatter={(v)=>`${Math.round(v*100)}%`} tick={{fill:'#6B7280'}} />
                  <Tooltip formatter={(v, n)=> n==='rate'? `${Math.round(v*100)}%` : v } labelClassName="text-[#1F2937]"/>
                  <Line type="monotone" dataKey="rate" stroke="#4B7353" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* 2) Comparații: per student / per disciplină */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Per Student */}
          <div className="rounded-2xl border border-[#E1E6E0] bg-[#F7F9F6] p-4">
            <h3 className="text-[#1F2937] font-medium mb-3">Prezențe per student</h3>
            {perStudent.loading && <p className="text-[#6B7280] p-6">Se încarcă…</p>}
            {perStudent.error && <p className="text-[#EF4444] p-6">{perStudent.error}</p>}
            {!perStudent.loading && !perStudent.error && (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(perStudent.data||[]).map(d=>({
                    nume:d.nume,
                    prezente:d.prezente,
                    procent: d.total? Math.round(100*d.prezente/d.total):0
                  }))} margin={{ left: 8, right: 16, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nume" tick={{fill:'#6B7280'}} interval={0} angle={-20} height={60} textAnchor="end" />
                    <YAxis tick={{fill:'#6B7280'}} />
                    <Tooltip labelClassName="text-[#1F2937]"/>
                    <Legend />
                    <Bar dataKey="prezente" name="Prezențe" fill="#4B7353" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Per Discipline */}
          <div className="rounded-2xl border border-[#E1E6E0] bg-[#F7F9F6] p-4">
            <h3 className="text-[#1F2937] font-medium mb-3">Prezențe per disciplină</h3>
            {perDisc.loading && <p className="text-[#6B7280] p-6">Se încarcă…</p>}
            {perDisc.error && <p className="text-[#EF4444] p-6">{perDisc.error}</p>}
            {!perDisc.loading && !perDisc.error && (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(perDisc.data||[]).map(d=>({ disciplina:d.disciplina, prezente:d.prezente, procent:d.total?Math.round(100*d.prezente/d.total):0 }))} margin={{ left: 8, right: 16, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="disciplina" tick={{fill:'#6B7280'}} interval={0} angle={-20} height={60} textAnchor="end" />
                    <YAxis tick={{fill:'#6B7280'}} />
                    <Tooltip labelClassName="text-[#1F2937]"/>
                    <Legend />
                    <Bar dataKey="prezente" name="Prezențe" fill="#4B7353" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        {/* 3) Top punctualitate */}
        <section className="rounded-2xl border border-[#E1E6E0] bg-[#F7F9F6] p-4">
          <h3 className="text-[#1F2937] font-medium mb-3">Top punctualitate</h3>
          {top.loading && <p className="text-[#6B7280] p-6">Se încarcă…</p>}
          {top.error && <p className="text-[#EF4444] p-6">{top.error}</p>}
          {!top.loading && !top.error && (
            <ol className="grid sm:grid-cols-3 gap-4">
              {(top.data||[]).slice(0,3).map((x,i)=> (
                <li key={i} className="rounded-2xl border border-[#E1E6E0] bg-white p-4">
                  <div className="text-sm text-[#6B7280]">#{i+1}</div>
                  <div className="text-[#1F2937] font-medium">{x.nume}</div>
                  <div className="text-sm text-[#6B7280]">medie sosire: <span className="text-[#1F2937] font-semibold">{x.media_minute_early?.toFixed ? x.media_minute_early.toFixed(1) : x.media_minute_early}</span> min mai devreme</div>
                </li>
              ))}
              {(!top.data || top.data.length===0) && (
                <li className="text-[#6B7280] p-4">Nu există date încă.</li>
              )}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
