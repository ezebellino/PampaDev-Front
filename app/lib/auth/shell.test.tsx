import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../ui/UIContext";

vi.mock("react-router", () => ({
  NavLink: ({ children, className, ...props }: React.ComponentProps<"a"> & { className?: unknown }) => (
    <a
      {...props}
      className={typeof className === "function" ? (className as (args: { isActive: boolean }) => string)({ isActive: false }) : (className as string | undefined)}
    >
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: "/app" }),
}));

vi.mock("../../components/layout/UserMenu", () => ({
  default: function UserMenu() {
    return <div>User menu</div>;
  },
}));

vi.mock("../../lib/companies/CompanyContext", () => ({
  useCompany: () => ({ companyId: 1 }),
}));

vi.mock("../../lib/api/hooks/useBranches", () => ({
  useBranches: () => ({ data: [{ idBranch: 1, idCompany: 1 }], loading: false, error: null }),
}));

vi.mock("../../lib/api/hooks/useCompanyBranches", () => ({
  useCompanyBranches: () => [{ idBranch: 1, idCompany: 1 }],
}));

vi.mock("../../lib/auth/AuthContext", () => ({
  useAuth: () => ({ user: { role: "ADMIN", email: "admin@pampadev.test", name: "Admin" } }),
}));

vi.mock("~/lib/companies/CompanyPicker", () => ({
  default: function CompanyPicker() {
    return <div>Company picker</div>;
  },
}));

vi.mock("../../components/branches/BranchPicker", () => ({
  default: function BranchPicker() {
    return <div>Branch picker</div>;
  },
}));

vi.mock("../../components/companies/CompanyPickerNavbar", () => ({
  default: function CompanyPickerNavbar() {
    return <div>Company picker navbar</div>;
  },
}));

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";

describe("mobile shell", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("opens the mobile menu and locks body scroll", async () => {
    render(
      <UIProvider>
        <Navbar sidebarCollapsed={false} />
        <Sidebar collapsed={false} onToggle={() => undefined} />
      </UIProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Abrir/i }));

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("hidden");
    });


    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("");
    });
  });
});


