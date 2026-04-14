import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Stripe
vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
    subscriptions: { retrieve: vi.fn() },
  },
  getPlanByPriceId: vi.fn(),
}));

// Mock Supabase SSR
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

import { stripe, getPlanByPriceId } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";

describe("POST /api/stripe/webhook", () => {
  let mockUpsert: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUpsert = vi.fn().mockResolvedValue({ error: null });
    mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    vi.mocked(createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        upsert: mockUpsert,
        update: mockUpdate,
      }),
    } as any);
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const { POST } = await import("../webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: "{}",
      headers: {},
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing stripe-signature header.");
  });

  it("returns 400 when signature verification fails", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const { POST } = await import("../webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "sig_invalid" },
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Webhook signature verification failed.");
  });

  it("handles checkout.session.completed event", async () => {
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { supabase_user_id: "user-123" },
          subscription: "sub_test",
          customer: "cus_test",
        },
      },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any);
    vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue({
      items: { data: [{ price: { id: "price_pro_test" } }] },
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
    } as any);
    vi.mocked(getPlanByPriceId).mockReturnValue("pro");

    const { POST } = await import("../webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: JSON.stringify(mockEvent),
      headers: { "stripe-signature": "sig_valid" },
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
  });

  it("handles customer.subscription.deleted event", async () => {
    const mockEvent = {
      type: "customer.subscription.deleted",
      data: {
        object: {
          customer: "cus_test",
          id: "sub_test",
        },
      },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any);

    const { POST } = await import("../webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: JSON.stringify(mockEvent),
      headers: { "stripe-signature": "sig_valid" },
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
  });

  it("handles invoice.payment_failed event", async () => {
    const mockEvent = {
      type: "invoice.payment_failed",
      data: {
        object: {
          customer: "cus_test",
        },
      },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any);

    const { POST } = await import("../webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: JSON.stringify(mockEvent),
      headers: { "stripe-signature": "sig_valid" },
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
  });
});
