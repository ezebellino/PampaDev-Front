import { beforeEach, describe, expect, it } from "vitest";

import {
  getInstructorReservationRequests,
  getUserReservationRequests,
  persistInstructorReservationRequest,
  updateInstructorReservationStatus,
} from "./useInstructorRequests";

const STORAGE_KEY = "pampaDev-instructor-reservation-requests";

describe("useInstructorRequests storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists and deduplicates reservation requests by branch, slot and user", () => {
    persistInstructorReservationRequest({
      id: "req-1",
      branchId: 7,
      rubroId: "padel",
      slotId: "slot-1",
      userId: "42",
      userName: "Eze",
      status: "pending",
      createdAt: "2026-03-21T18:00:00.000Z",
    });

    persistInstructorReservationRequest({
      id: "req-2",
      branchId: 7,
      rubroId: "padel",
      slotId: "slot-1",
      userId: "42",
      userName: "Eze",
      status: "pending",
      createdAt: "2026-03-21T18:05:00.000Z",
    });

    const all = getInstructorReservationRequests(7);
    expect(all).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toHaveLength(1);
  });

  it("filters requests by user and updates status", () => {
    persistInstructorReservationRequest({
      id: "req-1",
      branchId: 7,
      rubroId: "pilates",
      slotId: "slot-2",
      userId: "99",
      userName: "Ana",
      status: "pending",
      createdAt: "2026-03-21T19:00:00.000Z",
    });

    updateInstructorReservationStatus("req-1", "confirmed");

    const mine = getUserReservationRequests("99", 7);
    expect(mine).toHaveLength(1);
    expect(mine[0]?.status).toBe("confirmed");
  });

  it("allows booking the same slot again after cancellation", () => {
    persistInstructorReservationRequest({
      id: "req-1",
      branchId: 7,
      rubroId: "pilates",
      slotId: "slot-3",
      userId: "99",
      userName: "Ana",
      status: "pending",
      createdAt: "2026-03-21T19:00:00.000Z",
    });

    updateInstructorReservationStatus("req-1", "cancelled");

    persistInstructorReservationRequest({
      id: "req-2",
      branchId: 7,
      rubroId: "pilates",
      slotId: "slot-3",
      userId: "99",
      userName: "Ana",
      status: "pending",
      createdAt: "2026-03-21T20:00:00.000Z",
    });

    const mine = getUserReservationRequests("99", 7);
    expect(mine).toHaveLength(2);
    expect(mine[0]?.status).toBe("pending");
    expect(mine[1]?.status).toBe("cancelled");
  });
});
