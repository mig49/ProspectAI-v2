import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock Supabase SSR
const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn().mockImplementation(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

import { updateSession } from "@/lib/supabase/middleware";

function createRequest(pathname: string): NextRequest {
  return new NextRequest(`http://localhost:3000${pathname}`);
}

describe("updateSession middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows authenticated user to pass through", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    const req = createRequest("/");
    const res = await updateSession(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects unauthenticated user to /login", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const req = createRequest("/");
    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("does not redirect /login path for unauthenticated user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const req = createRequest("/login");
    const res = await updateSession(req);

    expect(res.status).toBe(200);
  });

  it("does not redirect /auth paths for unauthenticated user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const req = createRequest("/auth/callback");
    const res = await updateSession(req);

    expect(res.status).toBe(200);
  });

  it("redirects /api paths for unauthenticated user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const req = createRequest("/api/prospect");
    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });
});
