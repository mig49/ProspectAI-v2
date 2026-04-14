import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { getUserPlan, checkUsageLimit, incrementUsage, paywallResponse } from "@/lib/subscription";

describe("subscription helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserPlan", () => {
    it("returns 'free' when no subscription exists", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null }),
            }),
          }),
        }),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const plan = await getUserPlan("user-123");
      expect(plan).toBe("free");
    });

    it("returns 'free' when subscription status is canceled", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { plan: "pro", status: "canceled" } }),
            }),
          }),
        }),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const plan = await getUserPlan("user-123");
      expect(plan).toBe("free");
    });

    it("returns 'pro' when subscription is active pro", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { plan: "pro", status: "active" } }),
            }),
          }),
        }),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const plan = await getUserPlan("user-123");
      expect(plan).toBe("pro");
    });
  });

  describe("checkUsageLimit", () => {
    it("allows usage when under limit", async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "subscriptions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { plan: "free", status: "active" } }),
                }),
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { searches_count: 1, reports_count: 0, exports_count: 0 } }),
                }),
              }),
            }),
          };
        }),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await checkUsageLimit("user-123", "searches");
      expect(result.allowed).toBe(true);
      expect(result.used).toBe(1);
      expect(result.limit).toBe(3);
      expect(result.plan).toBe("free");
    });

    it("blocks usage when at limit", async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "subscriptions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { plan: "free", status: "active" } }),
                }),
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { searches_count: 3, reports_count: 0, exports_count: 0 } }),
                }),
              }),
            }),
          };
        }),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await checkUsageLimit("user-123", "searches");
      expect(result.allowed).toBe(false);
      expect(result.used).toBe(3);
      expect(result.limit).toBe(3);
    });

    it("allows pro users higher limits", async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "subscriptions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { plan: "pro", status: "active" } }),
                }),
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { searches_count: 10, reports_count: 0, exports_count: 0 } }),
                }),
              }),
            }),
          };
        }),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await checkUsageLimit("user-123", "searches");
      expect(result.allowed).toBe(true);
      expect(result.used).toBe(10);
      expect(result.limit).toBe(30);
      expect(result.plan).toBe("pro");
    });
  });

  describe("paywallResponse", () => {
    it("returns correct paywall format", () => {
      const response = paywallResponse("searches", "free", 3, 3);
      expect(response).toEqual({
        error: "Limite de buscas excedido para o plano Free.",
        plan: "free",
        used: 3,
        limit: 3,
        upgradeUrl: "/pricing",
      });
    });

    it("returns correct format for reports", () => {
      const response = paywallResponse("reports", "free", 1, 1);
      expect(response.error).toBe("Limite de relatorios excedido para o plano Free.");
    });
  });
});
