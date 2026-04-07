import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@/lib/supabase/server", () => {
  const mockSingle = vi.fn().mockResolvedValue({ data: { id: "db-uuid-123", detailed_report: null } });
  const mockUpdateEq = vi.fn().mockResolvedValue({ data: null });
  return {
    createClient: vi.fn().mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "test-user-id" } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ single: mockSingle }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: mockUpdateEq,
        }),
      }),
    }),
    __mockSingle: mockSingle,
  };
});

// Mock Gemini with proper class
vi.mock("@google/genai", () => {
  class MockGoogleGenAI {
    models = {
      generateContent: vi.fn().mockResolvedValue({
        text: "## Report content here",
      }),
    };
  }
  return { GoogleGenAI: MockGoogleGenAI };
});

// Mock rate limit
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({
    success: true,
    remaining: 19,
    reset: new Date(),
    limit: 20,
  }),
  getRateLimitIdentifier: vi.fn().mockResolvedValue("user:test-user-id"),
  rateLimitHeaders: vi.fn().mockReturnValue({
    "X-RateLimit-Limit": "20",
    "X-RateLimit-Remaining": "19",
    "X-RateLimit-Reset": new Date().toISOString(),
  }),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

import { POST } from "@/app/api/prospect/report/route";
import { NextRequest } from "next/server";

function createRequest(body: any): NextRequest {
  return new NextRequest("http://localhost:3000/api/prospect/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  leadId: "lead-external-123",
  lead: { name: "Test Business", address: "Rua Test 1" },
  service: "chatbot AI",
};

describe("POST /api/prospect/report", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
  });

  it("returns 400 for missing leadId", async () => {
    const req = createRequest({
      lead: { name: "Test", address: "Rua 1" },
      service: "AI",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing service", async () => {
    const req = createRequest({
      leadId: "lead-123",
      lead: { name: "Test", address: "Rua 1" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 403 when lead does not belong to user", async () => {
    const { __mockSingle } = await import("@/lib/supabase/server") as any;
    __mockSingle.mockResolvedValueOnce({ data: null });

    const req = createRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Acesso negado");
  });

  it("returns cached report when available", async () => {
    const { __mockSingle } = await import("@/lib/supabase/server") as any;
    __mockSingle.mockResolvedValueOnce({
      data: { id: "db-uuid-123", detailed_report: "## Cached report" },
    });

    const req = createRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.report).toBe("## Cached report");
    expect(data.cached).toBe(true);
  });

  it("generates new report when no cache", async () => {
    const { __mockSingle } = await import("@/lib/supabase/server") as any;
    __mockSingle.mockResolvedValueOnce({
      data: { id: "db-uuid-123", detailed_report: null },
    });

    const req = createRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.report).toBeDefined();
    expect(data.cached).toBe(false);
  });

  it("regenerates when forceRegenerate is true", async () => {
    const { __mockSingle } = await import("@/lib/supabase/server") as any;
    __mockSingle.mockResolvedValueOnce({
      data: { id: "db-uuid-123", detailed_report: "## Old report" },
    });

    const req = createRequest({ ...validBody, forceRegenerate: true });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.cached).toBe(false);
  });
});
