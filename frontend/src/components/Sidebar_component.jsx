// src/components/Sidebar_component.jsx
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  Wifi,
  BadgeCheck,
} from "lucide-react";

/* rute + iconițe */
const links = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/studenti",  label: "Studenți",  icon: Users },
  { to: "/prezente",  label: "Prezențe",  icon: FileText },
  { to: "/Statistici",   label: "Statistici",   icon: BarChart3 },
  { to: "/setari",    label: "Setări",    icon: Settings },
];

export default function Sidebar_component({
  status = "Online",
  lastSync = "acum 2 min",
  onEspConnect,
  className = "",
}) {
  return (
    <aside
      className={[
        "h-screen w-64 shrink-0 border-r border-[#E1E6E0] bg-[#F7F9F6]",
        className,
      ].join(" ")}
    >
      {/* Brand */}
      <div className="px-4 py-4 flex items-center gap-2">
        <BadgeCheck className="size-6 text-[#4B7353]" />
        <div>
          <div className="font-semibold text-[#1F2937]">RFID Monitor</div>
          <div className="text-xs text-[#6B7280]">Prezență Studenți</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-2 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm",
                isActive
                  ? "bg-[#4B7353] text-white"
                  : "text-[#1F2937] hover:bg-[#537E54] hover:text-white",
              ].join(" ")
            }
          >
            <Icon className="size-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ESP status card */}
      <div className="mx-3 mt-4 rounded-2xl bg-white border border-[#E1E6E0] p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-emerald-700">{status}</span>
        </div>
        <div className="mt-1 text-xs text-[#6B7280]">
          Ultima sincronizare: {lastSync}
        </div>
        <button
          onClick={onEspConnect}
          className="mt-3 w-full rounded-xl border border-[#4B7353] text-[#4B7353] px-3 py-2 text-sm font-medium hover:bg-[#4B7353] hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <Wifi className="size-4" />
          ESP Connect
        </button>
      </div>
    </aside>
  );
}
