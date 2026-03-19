import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_EXPIRED_EVENT } from "../api/api";
import { AuthProvider, useAuth } from "./AuthContext";

const {
  clearSessionMock,
  persistSessionMock,
  getStoredSessionMock,
  refreshCurrentUserMock,
  buildUserFromLoginResponseMock,
  loginApiMock,
} = vi.hoisted(() => ({
  clearSessionMock: vi.fn(),
  persistSessionMock: vi.fn(),
  getStoredSessionMock: vi.fn(),
  refreshCurrentUserMock: vi.fn(),
  buildUserFromLoginResponseMock: vi.fn(),
  loginApiMock: vi.fn(),
}));

vi.mock("../api/services/auth", () => ({
  loginApi: loginApiMock,
}));

vi.mock("./tokenRefresh", () => ({
  clearSession: clearSessionMock,
  persistSession: persistSessionMock,
  getStoredSession: getStoredSessionMock,
  refreshCurrentUser: refreshCurrentUserMock,
  buildUserFromLoginResponse: buildUserFromLoginResponseMock,
}));

function AuthProbe() {
  const { isAuthed, user, bootstrapped } = useAuth();

  return (
    <div>
      <div data-testid="bootstrapped">{String(bootstrapped)}</div>
      <div data-testid="authed">{String(isAuthed)}</div>
      <div data-testid="user">{user?.email ?? "none"}</div>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStoredSessionMock.mockReturnValue({
      token: "token-123",
      user: { id: "1", email: "admin@pampadev.test", name: "Admin", role: "ADMIN" },
    });
    refreshCurrentUserMock.mockResolvedValue({
      id: "1",
      email: "admin@pampadev.test",
      name: "Admin",
      role: "ADMIN",
    });
  });

  it("cleans the session when the auth expired event is dispatched", async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("bootstrapped").textContent).toBe("true");
    });

    expect(screen.getByTestId("authed").textContent).toBe("true");
    expect(screen.getByTestId("user").textContent).toBe("admin@pampadev.test");

    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));

    await waitFor(() => {
      expect(screen.getByTestId("authed").textContent).toBe("false");
    });

    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(clearSessionMock).toHaveBeenCalled();
  });
});
