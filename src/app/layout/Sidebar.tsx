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
import { useTranslation } from "react-i18next";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation();

  const navItems = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/transactions", label: t("nav.transactions"), icon: ArrowLeftRight },
    { to: "/budgets", label: t("nav.budgets"), icon: Wallet },
    { to: "/goals", label: t("nav.goals"), icon: Target },
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <aside className={cx(
      "h-screen sticky top-0 flex flex-col border-r border-app bg-app text-app",
      collapsed ? "w-20" : "w-72"
    )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/90 to-cyan-400/80" />
        {!collapsed && (
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">FinTrack</div>
            <div className="text-xs text-muted">{t("sidebar.tagline")}</div>
          </div>
        )}

        <button
          onClick={onToggle}
          className={cx(
            "ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5",
            collapsed && "ml-0"
          )}
          aria-label={collapsed ? t("sidebar.expandAria") : t("sidebar.collapseAria")}
          title={collapsed ? t("sidebar.expandTitle") : t("sidebar.collapseTitle")}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 py-2">
        <div className={cx("text-xs text-muted px-3 pb-2", collapsed && "sr-only")}>
          {t("sidebar.overview")}
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
                  <Icon
                    size={18}
                    className="shrink-0 text-muted group-hover:text-app"
                  />
                  {!collapsed && <span className="text-slate-200">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto p-3">
        {/* Profile (mock) */}
        <div className={cx("mt-3 flex items-center gap-3 rounded-xl px-3 py-3", "bg-white/5")}>
          <div className="h-9 w-9 rounded-full bg-slate-700" />
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Agustín Juárez</div>
              <div className="truncate text-xs text-slate-400">{t("sidebar.plan")}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
