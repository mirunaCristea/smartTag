import { useState } from "react";
import Sidebar from "../components/Sidebar_component";

function Section({title, children}) {
  return (
    <div className="admin-card">
      <h3 className="admin-section-title mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function AdminSettings(){
  const [tab, setTab] = useState("profesori");

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="space-y-6 flex-1 w-full px-8 py-6 ">

      {/* Tabs */}

      <div className="space-x-2">

        {["profesori","sesiuni","notificari"].map(t => (
          <button
            key={t}
            onClick={()=>setTab(t)}
            className={`admin-btn ${tab===t ? "" : "opacity-80"}`}
            aria-pressed={tab===t}
          >
            {t==="profesori" ? "Profesori" : t==="sesiuni" ? "Sesiuni" : "Notificări"}
          </button>
        ))}
      </div>
     

      {/* Content */}
      {tab==="profesori" && (
        <Section title="Adaugă / Șterge profesori">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="admin-label">Nume profesor</label>
              <input className="admin-input" placeholder="ex: Ionescu Andrei" />
            </div>
            <div>
              <label className="admin-label">Email (opțional)</label>
              <input className="admin-input" placeholder="ex: a.ionescu@uni.ro" />
            </div>
            <div className="flex items-end">
              <button type="button" className="admin-btn w-full">Adaugă</button>
            </div>
          </form>

          <div className="mt-4 border rounded-xl" style={{borderColor:"var(--border)"}}>
            <table className="w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="p-3">Profesor</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {/* Exemplu static; vom lega de backend ulterior */}
                <tr className="border-t" style={{borderColor:"var(--border)"}}>
                  <td className="p-3">Ionescu Andrei</td>
                  <td className="p-3">a.ionescu@uni.ro</td>
                  <td className="p-3">
                    <button className="text-sm" style={{color:"var(--error)"}}>Șterge</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {tab==="sesiuni" && (
        <Section title="Configurează sesiuni">
          <form className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="admin-label">Data</label>
              <input type="date" className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Începe</label>
              <input type="time" className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Se termină</label>
              <input type="time" className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Tip</label>
              <select className="admin-input">
                <option>Laborator</option>
                <option>Curs</option>
                <option>Seminar</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="button" className="admin-btn w-full">Activează azi</button>
            </div>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            Exemplu: <span className="font-medium" style={{color:"var(--text)"}}>azi 10:00–12:00</span> → „laborator activ”.
          </div>
        </Section>
      )}

      {tab==="notificari" && (
        <Section title="Notificări">
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="scale-110" />
              <span className="text-sm" style={{color:"var(--text)"}}>
                Trimite alertă dacă un student fără acces încearcă să intre
              </span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="admin-label">Email de alertă</label>
                <input className="admin-input" placeholder="ex: securitate@uni.ro" />
              </div>
              <div>
                <label className="admin-label">Webhook (opțional)</label>
                <input className="admin-input" placeholder="https://exemplu/alert" />
              </div>
              <div className="flex items-end">
                <button type="button" className="admin-btn w-full">Salvează</button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Sugestie: poți trimite **toast** la UI + email/webhook la backend când primești un acces „refuzat”.
            </div>
          </div>
        </Section>
      )}
    </div>
    </div>
  );
}
