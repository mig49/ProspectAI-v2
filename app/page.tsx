"use client";

import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import { ResultsList } from "@/components/ResultsList";
import { LeadDetail } from "@/components/LeadDetail";
import { Lead, SearchParams } from "@/types";
import { Sparkles, LogOut } from "lucide-react";
import { useProspectSearch } from "@/hooks/use-prospect-search";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "motion/react";

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
    <div className="min-h-screen bg-[var(--color-background)] font-sans">
      <header className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleBackToSearch}
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow-[var(--shadow-blue-md)]">
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
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-dot-pattern">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center justify-between"
              role="alert"
              aria-live="assertive"
            >
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                aria-label="Fechar alerta"
              >
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            </motion.div>
          )}

          {step === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ResultsList
                results={results}
                onSelectLead={handleSelectLead}
                onBack={handleBackToSearch}
              />
            </motion.div>
          )}

          {step === "detail" && selectedLead && searchParams && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <LeadDetail
                lead={selectedLead}
                searchParams={searchParams}
                onBack={handleBackToResults}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
