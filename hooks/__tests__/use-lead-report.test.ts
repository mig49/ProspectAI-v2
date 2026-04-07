import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLeadReport } from "@/hooks/use-lead-report";
import { Lead, SearchParams } from "@/types";

const mockLead: Lead = {
  id: "lead-123",
  name: "Test Business",
  address: "Rua Test 1",
  city: "Lisboa",
  state: "Lisboa",
  rating: 4.5,
  userRatingCount: 100,
  types: ["restaurant"],
  primaryType: "restaurant",
  digitalPainScore: 80,
  aiSummary: "Good lead",
};

const mockParams: SearchParams = {
  icp: "restaurantes",
  service: "chatbot AI",
  state: "Lisboa",
  city: "",
};

describe("useLeadReport", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("auto-fetches report on mount", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ report: "## Report content" }),
    });

    const { result } = renderHook(() => useLeadReport(mockLead, mockParams));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.report).toBe("## Report content");
    expect(result.current.error).toBeNull();
  });

  it("handles API error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Erro ao gerar" }),
    });

    const { result } = renderHook(() => useLeadReport(mockLead, mockParams));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.report).toBeNull();
    expect(result.current.error).toBe("Erro ao gerar");
  });

  it("handles network error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

    const { result } = renderHook(() => useLeadReport(mockLead, mockParams));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network failure");
  });

  it("supports retry", async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "Erro" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ report: "## Retry success" }),
      });
    });

    const { result } = renderHook(() => useLeadReport(mockLead, mockParams));

    await waitFor(() => {
      expect(result.current.error).toBe("Erro");
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.report).toBe("## Retry success");
    expect(result.current.error).toBeNull();
  });
});
