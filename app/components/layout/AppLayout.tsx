// AppLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_22%)]" />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div
        className={[
          "relative min-h-screen flex flex-col transition-all duration-200",
          "pt-16",
          collapsed ? "md:pl-28" : "md:pl-72",
        ].join(" ")}
      >
        <Navbar sidebarCollapsed={collapsed} />

        <main className="flex-1 px-4 py-6 sm:px-5 md:px-8 md:py-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1580px]">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
