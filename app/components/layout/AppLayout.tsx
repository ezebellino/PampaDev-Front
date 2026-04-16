import React, { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.34),transparent_55%)]" />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />

      <div
        className={[
          "relative flex min-h-screen flex-col transition-all duration-300",
          "pt-20",
          collapsed ? "md:pl-28" : "md:pl-[19rem]",
        ].join(" ")}
      >
        <Navbar sidebarCollapsed={collapsed} />

        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
