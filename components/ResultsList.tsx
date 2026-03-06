"use client";

import { useState, useEffect } from "react";
import { Lead } from "@/types";
import { Button } from "./ui/button";
import {
  LayoutGrid,
  List,
  Star,
  MapPin,
  Building2,
  ExternalLink,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsListProps {
  results: Lead[];
  onSelectLead: (lead: Lead) => void;
  onBack: () => void;
}

export function ResultsList({
  results,
  onSelectLead,
  onBack,
}: ResultsListProps) {
  const [viewMode, setViewMode] = useState<"card" | "table">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("prospectai-view-mode");
      if (saved === "card" || saved === "table") {
        return saved;
      }
    }
    return "card";
  });

  const toggleViewMode = (mode: "card" | "table") => {
    setViewMode(mode);
    localStorage.setItem("prospectai-view-mode", mode);
  };

  const getScoreColor = (score: number) => {
    if (score <= 30)
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (score <= 60) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-rose-100 text-rose-800 border-rose-200";
  };

  const getScoreLabel = (score: number) => {
    if (score <= 30) return "Baixa Oportunidade";
    if (score <= 60) return "Média Oportunidade";
    return "Alta Oportunidade";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-2 -ml-4 text-slate-600"
          >
            &larr; Nova Busca
          </Button>
          <h2 className="text-2xl font-bold text-slate-900">
            {results.length} Leads Encontrados
          </h2>
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
          <button
            onClick={() => toggleViewMode("card")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "card"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:text-slate-900",
            )}
            title="Visualização em Cards"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleViewMode("table")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "table"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:text-slate-900",
            )}
            title="Visualização em Tabela"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-2">
                    {lead.name}
                  </h3>
                  <div
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ml-3",
                      getScoreColor(lead.digitalPainScore),
                    )}
                  >
                    {lead.digitalPainScore} / 100
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">
                      {lead.primaryType?.replace(/_/g, " ") || "Negócio Local"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">
                      {lead.city}, {lead.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400" />
                    <span>
                      {lead.rating || "N/A"} ({lead.userRatingCount || 0}{" "}
                      avaliações)
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                  <p className="text-sm text-slate-700 italic line-clamp-3">
                    &quot;{lead.aiSummary}&quot;
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <Button className="w-full" onClick={() => onSelectLead(lead)}>
                  Ver Relatório Completo
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">Local</th>
                <th className="px-6 py-4 font-medium">Avaliação</th>
                <th className="px-6 py-4 font-medium">Pain Score</th>
                <th className="px-6 py-4 font-medium">Contato</th>
                <th className="px-6 py-4 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {results.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td
                    className="px-6 py-4 font-medium text-slate-900 max-w-[200px] truncate"
                    title={lead.name}
                  >
                    {lead.name}
                    <div className="text-xs text-slate-600 font-normal mt-1">
                      {lead.primaryType?.replace(/_/g, " ")}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {lead.city}, {lead.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-medium">{lead.rating || "-"}</span>
                      <span className="text-slate-600 text-xs">
                        ({lead.userRatingCount || 0})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        "inline-flex px-2 py-1 rounded text-xs font-medium border",
                        getScoreColor(lead.digitalPainScore),
                      )}
                    >
                      {lead.digitalPainScore}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {lead.nationalPhoneNumber ? (
                        <a
                          href={`tel:${lead.nationalPhoneNumber}`}
                          className="text-slate-600 hover:text-blue-600"
                          title={lead.nationalPhoneNumber}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      ) : (
                        <Phone className="w-4 h-4 text-slate-200" />
                      )}
                      {lead.websiteUri ? (
                        <a
                          href={lead.websiteUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:text-blue-600"
                          title="Website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <ExternalLink className="w-4 h-4 text-slate-200" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectLead(lead)}
                    >
                      Relatório
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
