import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
      }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "search-1" } }),
        }),
      }),
    }),
  }),
}));

// Mock Gemini with proper class
vi.mock("@google/genai", () => {
  class MockGoogleGenAI {
    models = {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify([
          {
            id: "lead-1",
            name: "Test Business",
            address: "Rua Test 1",
            city: "Lisboa",
            state: "Lisboa",
            rating: 4.5,
            userRatingCount: 100,
            primaryType: "restaurant",
            digitalPainScore: 80,
            aiSummary: "Good lead",
          },
        ]),
        candidates: [],
      }),
    };
  }
  return { GoogleGenAI: MockGoogleGenAI };
});

// Mock rate limit
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({
    success: true,
    remaining: 9,
    reset: new Date(),
    limit: 10,
  }),
  getRateLimitIdentifier: vi.fn().mockResolvedValue("user:test-user-id"),
  rateLimitHeaders: vi.fn().mockReturnValue({
    "X-RateLimit-Limit": "10",
    "X-RateLimit-Remaining": "9",
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

import { POST } from "@/app/api/prospect/route";
import { NextRequest } from "next/server";

function createRequest(body: any): NextRequest {
  return new NextRequest("http://localhost:3000/api/prospect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/prospect", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
  });

  it("returns 400 for invalid input (missing icp)", async () => {
    const req = createRequest({ service: "AI", state: "Lisboa" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("invalidos");
  });

  it("returns 400 for empty icp", async () => {
    const req = createRequest({ icp: "", service: "AI", state: "Lisboa" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 when GEMINI_API_KEY is missing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const req = createRequest({
      icp: "restaurantes",
      service: "AI",
      state: "Lisboa",
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("GEMINI_API_KEY");
  });

  it("returns leads on valid request", async () => {
    const req = createRequest({
      icp: "restaurantes",
      service: "chatbot AI",
      state: "Lisboa",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.leads).toBeDefined();
    expect(Array.isArray(data.leads)).toBe(true);
  });
});
