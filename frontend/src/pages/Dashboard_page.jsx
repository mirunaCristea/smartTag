import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar_component";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

/* === KPI Card === */
function KPICard({ label, value, sublabel, trend }) {
  return (
    <div className="rounded-2xl border border-[#E1E6E0] bg-[#F7F9F6] p-4 shadow-sm hover:shadow transition-shadow">
      <div className="text-sm text-gray-600 flex items-center justify-between">
        <span>{label}</span>
        {typeof trend === "number" && (
          <span
            className={cn(
              "text-xs font-medium",
              trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : "text-gray-500"
            )}
          >
            {trend > 0 ? `▲ ${trend}%` : trend < 0 ? `▼ ${Math.abs(trend)}%` : "—"}
          </span>
        )}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-gray-500">{sublabel}</div>}
    </div>
  );
}

/* === System Status === */
function SystemStatus({ apiStatus, lastSync, devicesOnline, apiUrl }) {
  return (
    <div className="rounded-2xl border border-[#E1E6E0] bg-[#F7F9F6] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">System status</h3>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            apiStatus === "online"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          )}
        >
          {apiStatus}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <p className="text-gray-500">Last sync</p>
          <p className="font-medium">{lastSync}</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-500">Devices online</p>
          <p className="font-medium">{devicesOnline}</p>
        </div>
        <div className="col-span-2 space-y-1">
          <p className="text-gray-500">API URL</p>
          <code className="block w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs">
            {apiUrl}
          </code>
        </div>
      </div>
    </div>
  );
}

/* === Live Feed === */
function LiveFeed({ rows, onClear }) {
  return (
    <div className="rounded-2xl border border-[#E1E6E0] bg-[#F4F7F5] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E1E6E0]">
        <h3 className="text-sm font-medium text-gray-700">Prezențe live</h3>
        <button
          onClick={onClear}
          className="text-xs px-2 py-1 rounded-md border border-[#E1E6E0] hover:bg-[#537E54] hover:text-white "
        >
          Clear
        </button>
      </div>
      <div className="max-h-[320px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#F4F7F5] border-b border-[#E1E6E0]">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">UID (hash)</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                  Waiting for scans…
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-[#E1E6E0] hover:bg-[#537E54] hover:text-white">
                <td className="px-4 py-2 tabular-nums text-gray-700">{r.time}</td>
                <td className="px-4 py-2 text-gray-800">{r.name}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-800">{r.uid}</td>
                <td className="px-4 py-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-semibold",
                      r.status === "OK"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                    )}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* === Attendance Chart (CSS-only bars) === */
function AttendanceChart({ series, labels }) {
  const max = Math.max(1, ...series);
  return (
    <div className="rounded-2xl border border-[#E1E6E0] bg-[#F7F9F6] p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Rată prezență (ultimele 7 zile)</h3>
      <div className="flex items-end gap-3 h-40">
        {series.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-full rounded-t-md"
              style={{
                height: `${(v / max) * 100}%`,
                // emerald + teal pentru ritm cromatic plăcut
                backgroundColor: i % 2 === 0 ? "rgb(5 150 105)" : "rgb(45 212 191)", // emerald-600 / teal-400
              }}
            />
            <span className="text-[10px] text-gray-500">{labels[i]}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500">% din studenți prezenți</div>
    </div>
  );
}

/* === Recent Activity === */
function RecentActivity({ items }) {
  return (
    <div className="rounded-2xl border border-[#E1E6E0] bg-[#F7F9F6] p-4 shadow-sm">
      <h3 className="text-sm font-medium text-emerald-900 mb-2">Activitate recentă</h3>
      <ul className="space-y-2">
        {items.length === 0 && <li className="text-gray-400 text-sm">Nimic nou.</li>}
        {items.map((x, i) => (
          <li key={i} className="text-sm text-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="tabular-nums text-gray-500">{x.time}</span>
              <span>•</span>
              <span className="font-medium">{x.text}</span>
            </div>
            <span className="px-2 py-0.5 text-[11px] rounded-full bg-[#F7F9F6] text-emerald-700">
              prezent
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* === Quick Actions === */
function QuickActions({ onStartSession, onExportCsv, onRefresh }) {
  const Btn = ({ children, onClick }) => (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-xl border border-[#E1E6E0] text-sm text-emerald-800 hover:bg-[#537E54] hover:text-white transition-colors"
    >
      {children}
    </button>
  );
  return (
    <div className="rounded-2xl border border-[#E1E6E0] bg-[#F7F9F6] p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Acțiuni rapide</h3>
      <div className="flex flex-wrap gap-2">
        <Btn onClick={onStartSession}>Pornește sesiune</Btn>
        <Btn onClick={onExportCsv}>Export CSV</Btn>
        <Btn onClick={onRefresh}>Refresh</Btn>
      </div>
    </div>
  );
}

/* === PAGE === */
export default function Dashboard() {
  const [presentToday, setPresentToday] = useState(23);
  const [absentToday, setAbsentToday] = useState(7);
  const [activeSessions, setActiveSessions] = useState(1);
  const [devicesOnline, setDevicesOnline] = useState(2);
  const [apiStatus, setApiStatus] = useState("online");
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [apiUrl] = useState("http://127.0.0.1:5000");

  const [feed, setFeed] = useState([
    { time: "10:02", name: "Popescu Ana", uid: "b4c…89f1", status: "OK" },
    { time: "10:05", name: "Ionescu Dan", uid: "2ad…a112", status: "NOK" },
  ]);

  const activity = useMemo(
    () => [
      { time: "09:55", text: "Sesiune laborator – SPA pornită" },
      { time: "10:05", text: "Scan respins (UID necunoscut)" },
    ],
    []
  );

  const wsTimer = useRef(null);
  useEffect(() => {
    wsTimer.current = setInterval(() => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      setFeed((prev) => [
        {
          time: `${hh}:${mm}`,
          name: "Student demo",
          uid: Math.random().toString(16).slice(2, 6) + "…" + Math.random().toString(16).slice(2, 6),
          status: Math.random() > 0.85 ? "NOK" : "OK",
        },
        ...prev,
      ].slice(0, 25));
      setPresentToday((x) => x + 1);
      setLastSync(now.toLocaleTimeString());
    }, 8000);
    return () => clearInterval(wsTimer.current);
  }, []);

  const chart = useMemo(
    () => ({
      labels: ["Lu", "Ma", "Mi", "Jo", "Vi", "Sa", "Du"],
      series: [62, 70, 65, 88, 90, 20, 15],
    }),
    []
  );

  function handleStartSession() {
    setActiveSessions(1);
  }
  function handleExportCsv() {
    alert("Export CSV – conectează la backend");
  }
  function handleRefresh() {
    setApiStatus("online");
    setLastSync(new Date().toLocaleTimeString());
  }

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-dvh">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
            {/* Header */}
            <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-emerald-800">
                  SmartTag • Dashboard
                </h1>
                <p className="text-gray-500 text-sm">Monitorizare prezențe în timp real</p>
              </div>
              <div className="text-sm text-gray-500">{new Date().toLocaleString()}</div>
            </header>

            {/* KPI Row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <KPICard label="Prezenți azi" value={<span className="text-emerald-700">{presentToday}</span>} sublabel="actualizat live" trend={8} />
              <KPICard label="Absenți azi" value={<span className="text-rose-600">{absentToday}</span>} trend={-2} />
              <KPICard label="Sesiuni active" value={<span className="text-emerald-700">{activeSessions}</span>} />
              <KPICard label="Dispozitive online" value={<span className="text-emerald-700">{devicesOnline}</span>} />
            </section>

            {/* Main Grid */}
            <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <LiveFeed rows={feed} onClear={() => setFeed([])} />
                <AttendanceChart labels={chart.labels} series={chart.series} />
              </div>

              <div className="space-y-4">
                <SystemStatus apiStatus={apiStatus} lastSync={lastSync} devicesOnline={devicesOnline} apiUrl={apiUrl} />
                <QuickActions onStartSession={handleStartSession} onExportCsv={handleExportCsv} onRefresh={handleRefresh} />
                <RecentActivity items={activity} />
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-8 text-center text-xs text-gray-400">
              © {new Date().getFullYear()} SmartTag — build {import.meta?.env?.VITE_COMMIT_SHA || "dev"}
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
