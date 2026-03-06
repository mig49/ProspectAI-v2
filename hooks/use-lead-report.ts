import { useState, useEffect } from "react";
import { Lead, SearchParams } from "@/types";

export function useLeadReport(lead: Lead, searchParams: SearchParams) {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/prospect/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            name: lead.name,
            address: lead.address,
            rating: lead.rating,
            userRatingCount: lead.userRatingCount,
            websiteUri: lead.websiteUri,
            nationalPhoneNumber: lead.nationalPhoneNumber,
            types: lead.types,
            reviews: lead.reviews,
          },
          service: searchParams.service,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar relatorio.");
      }

      setReport(data.report);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao gerar o relatorio de IA.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [lead.id]);

  return { report, isLoading, error, retry: fetchReport };
}
