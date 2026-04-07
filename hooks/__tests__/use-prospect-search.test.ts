import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProspectSearch } from "@/hooks/use-prospect-search";

const mockLeads = [
  { id: "1", name: "Lead A", digitalPainScore: 80 },
  { id: "2", name: "Lead B", digitalPainScore: 60 },
];

describe("useProspectSearch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial state", () => {
    const { result } = renderHook(() => useProspectSearch());
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("searches and returns leads", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ leads: mockLeads }),
    });

    const { result } = renderHook(() => useProspectSearch());

    await act(async () => {
      await result.current.search({
        icp: "restaurantes",
        service: "AI",
        state: "Lisboa",
        city: "",
      });
    });

    expect(result.current.results).toEqual(mockLeads);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("handles API error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Erro de busca" }),
    });

    const { result } = renderHook(() => useProspectSearch());

    await act(async () => {
      await result.current.search({
        icp: "restaurantes",
        service: "AI",
        state: "Lisboa",
        city: "",
      });
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBe("Erro de busca");
  });

  it("handles network error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useProspectSearch());

    await act(async () => {
      await result.current.search({
        icp: "restaurantes",
        service: "AI",
        state: "Lisboa",
        city: "",
      });
    });

    expect(result.current.error).toBe("Network error");
  });

  it("clears results", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ leads: mockLeads }),
    });

    const { result } = renderHook(() => useProspectSearch());

    await act(async () => {
      await result.current.search({
        icp: "restaurantes",
        service: "AI",
        state: "Lisboa",
        city: "",
      });
    });

    expect(result.current.results.length).toBe(2);

    act(() => {
      result.current.clearResults();
    });

    expect(result.current.results).toEqual([]);
  });

  it("clears error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useProspectSearch());

    await act(async () => {
      await result.current.search({
        icp: "test",
        service: "AI",
        state: "Lisboa",
        city: "",
      });
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
