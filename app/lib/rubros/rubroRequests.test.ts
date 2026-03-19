import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  RUBRO_REQUESTS_EVENT,
  createRubroRequest,
  listRubroRequests,
  reviewRubroRequest,
  subscribeToRubroRequests,
} from "./rubroRequests";

describe("rubroRequests storage domain", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns seeded requests by default", () => {
    const requests = listRubroRequests();

    expect(requests.length).toBeGreaterThan(0);
    expect(requests[0]).toHaveProperty("status");
  });

  it("creates a new request and notifies subscribers", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToRubroRequests(onChange);

    const created = createRubroRequest({
      requestedBy: "admin@pampadev.test",
      requestedByRole: "ADMIN",
      title: "Escalada",
      description: "Muros y clases grupales",
    });

    const requests = listRubroRequests();

    expect(created.status).toBe("pending");
    expect(requests[0]?.id).toBe(created.id);
    expect(onChange).toHaveBeenCalled();

    unsubscribe();
  });

  it("reviews an existing request", () => {
    const [firstRequest] = listRubroRequests();

    const reviewed = reviewRubroRequest(firstRequest.id, "approved", {
      reviewedBy: "dev@pampadev.test",
      devNotes: "Listo para pasar a backend.",
    });

    expect(reviewed.status).toBe("approved");
    expect(reviewed.reviewedBy).toBe("dev@pampadev.test");
    expect(listRubroRequests().find((request) => request.id === firstRequest.id)?.devNotes).toBe(
      "Listo para pasar a backend."
    );
  });

  it("exposes the same custom event name used for sync", () => {
    expect(RUBRO_REQUESTS_EVENT).toBe("pampadev:rubro-requests:changed");
  });
});