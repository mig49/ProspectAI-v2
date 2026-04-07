import { useState, useCallback } from "react";
import { Lead, SearchParams } from "@/types";

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function useProspectSearch() {
  const [results, setResults] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [lastParams, setLastParams] = useState<SearchParams | null>(null);

  const search = useCallback(async (params: SearchParams, page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/prospect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, page, limit: 20 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar leads.");
      }

      setResults(data.leads || []);
      setPagination({
        total: data.total ?? 0,
        page: data.page ?? 1,
        limit: data.limit ?? 20,
        totalPages: data.totalPages ?? 1,
      });
      setLastParams(params);
      return data.leads || [];
    } catch (err: any) {
      const message = err.message || "Ocorreu um erro inesperado.";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      if (lastParams) search(lastParams, page);
    },
    [lastParams, search]
  );

  const clearError = () => setError(null);
  const clearResults = () => {
    setResults([]);
    setPagination(null);
  };

  return {
    results,
    isLoading,
    error,
    pagination,
    search,
    goToPage,
    clearError,
    clearResults,
  };
}
