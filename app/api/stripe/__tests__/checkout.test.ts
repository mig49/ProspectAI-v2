import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Stripe
vi.mock("@/lib/stripe", () => ({
  stripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
  },
  PLANS: {
    free: { name: "Free", priceId: null },
    pro: { name: "Pro", priceId: "price_pro_test" },
    scale: { name: "Scale", priceId: "price_scale_test" },
  },
}));

// Mock Supabase server
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { stripe, PLANS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

describe("POST /api/stripe/checkout", () => {
  const mockUser = { id: "user-123", email: "test@test.com" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { POST } = await import("../checkout/route");
    const request = new Request("http://localhost/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify({ plan: "pro" }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Autenticacao necessaria.");
  });

  it("returns 400 for invalid plan", async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { POST } = await import("../checkout/route");
    const request = new Request("http://localhost/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify({ plan: "free" }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Plano invalido.");
  });

  it("creates checkout session for valid pro plan", async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    vi.mocked(stripe.customers.create).mockResolvedValue({
      id: "cus_test123",
    } as any);

    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
      url: "https://checkout.stripe.com/session_test",
    } as any);

    const { POST } = await import("../checkout/route");
    const request = new Request("http://localhost/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify({ plan: "pro" }),
      headers: { origin: "http://localhost:3000" },
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe("https://checkout.stripe.com/session_test");
    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: mockUser.email,
      metadata: { supabase_user_id: mockUser.id },
    });
  });

  it("reuses existing Stripe customer ID", async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: "cus_existing" },
            }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
      url: "https://checkout.stripe.com/session_test",
    } as any);

    const { POST } = await import("../checkout/route");
    const request = new Request("http://localhost/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify({ plan: "scale" }),
      headers: { origin: "http://localhost:3000" },
    });

    const response = await POST(request as any);

    expect(response.status).toBe(200);
    expect(stripe.customers.create).not.toHaveBeenCalled();
  });
});
