"use client";

import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import { ResultsList } from "@/components/ResultsList";
import { LeadDetail } from "@/components/LeadDetail";
import { Lead, SearchParams } from "@/types";
import { Sparkles, LogOut } from "lucide-react";
import { useProspectSearch } from "@/hooks/use-prospect-search";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [step, setStep] = useState<"search" | "results" | "detail">("search");
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { results, isLoading, error, search, clearError, clearResults } =
    useProspectSearch();

  const handleSearch = async (params: SearchParams) => {
    setSearchParams(params);
    const leads = await search(params);
    if (leads.length > 0) {
      setStep("results");
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setStep("detail");
  };

  const handleBackToSearch = () => {
    setStep("search");
    clearResults();
    setSelectedLead(null);
  };

  const handleBackToResults = () => {
    setStep("results");
    setSelectedLead(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleBackToSearch}
          >
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-xl tracking-tight">ProspectAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300 hidden sm:block">
              Prospecção Inteligente B2B
            </span>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {error && (
          <div
            className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center justify-between"
            role="alert"
            aria-live="assertive"
          >
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-rose-500 hover:text-rose-700 font-bold"
              aria-label="Fechar alerta"
            >
              &times;
            </button>
          </div>
        )}

        {step === "search" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          </div>
        )}

        {step === "results" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultsList
              results={results}
              onSelectLead={handleSelectLead}
              onBack={handleBackToSearch}
            />
          </div>
        )}

        {step === "detail" && selectedLead && searchParams && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LeadDetail
              lead={selectedLead}
              searchParams={searchParams}
              onBack={handleBackToResults}
            />
          </div>
        )}
      </main>
    </div>
  );
}
