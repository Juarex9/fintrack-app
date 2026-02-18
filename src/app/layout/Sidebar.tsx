import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budgets", icon: Wallet },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/settings", label: "Settings", icon: Settings}
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cx(
        "h-screen sticky top-0 flex flex-col border-r border-white/10 bg-slate-950 text-slate-100",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/90 to-cyan-400/80" />
        {!collapsed && (
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">FinTrack</div>
            <div className="text-xs text-slate-400">Personal Finance</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cx(
            "ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5",
            collapsed && "ml-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 py-2">
        <div className={cx("text-xs text-slate-500 px-3 pb-2", collapsed && "sr-only")}>
          Overview
        </div>

        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cx(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                      "hover:bg-white/5",
                      isActive && "bg-white/5 ring-1 ring-white/10",
                      collapsed && "justify-center"
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} className="shrink-0 text-slate-300 group-hover:text-slate-100" />
                  {!collapsed && <span className="text-slate-200">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5",
              isActive && "bg-white/5 ring-1 ring-white/10",
              collapsed && "justify-center"
            )
          }
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={18} className="text-slate-300" />
          {!collapsed && <span className="text-slate-200">Settings</span>}
        </NavLink>

        {/* Profile (mock) */}
        <div className={cx("mt-3 flex items-center gap-3 rounded-xl px-3 py-3", "bg-white/5")}>
          <div className="h-9 w-9 rounded-full bg-slate-700" />
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Agustín Juárez</div>
              <div className="truncate text-xs text-slate-400">Free plan</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
