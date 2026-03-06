import { useState } from "react";
import { Lead, SearchParams } from "@/types";

export function useProspectSearch() {
  const [results, setResults] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/prospect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar leads.");
      }

      setResults(data.leads || []);
      return data.leads || [];
    } catch (err: any) {
      const message = err.message || "Ocorreu um erro inesperado.";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearResults = () => setResults([]);

  return { results, isLoading, error, search, clearError, clearResults };
}
