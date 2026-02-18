import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { categoriesStorage } from "../../libs/storage/categories.storage";

export default function AppLayout() {
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    categoriesStorage.ensureSeeded();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <main className="min-h-screen flex-1">
          <div className="mx-auto max-w-[1400px] px-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
