"use client";

import { useState } from "react";
import { Lead, SearchParams } from "@/types";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  Copy,
  MapPin,
  Phone,
  Globe,
  Star,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { useLeadReport } from "@/hooks/use-lead-report";
import { motion, AnimatePresence } from "motion/react";

interface LeadDetailProps {
  lead: Lead;
  searchParams: SearchParams;
  onBack: () => void;
}

export function LeadDetail({ lead, searchParams, onBack }: LeadDetailProps) {
  const { report, isLoading, error, retry, regenerate } = useLeadReport(lead, searchParams);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-slate-600 -ml-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Voltar à Lista
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={regenerate}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
            Regenerar
          </Button>
          <Button
            variant="outline"
            onClick={copyToClipboard}
            disabled={!report || isLoading}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mr-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mr-2"
                >
                  <Copy className="w-4 h-4" aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
            {copied ? "Copiado!" : "Copiar Relatório"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business Info */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="glass-card rounded-xl p-6 shadow-md"
          >
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {lead.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
              <span className="capitalize">
                {lead.primaryType?.replace(/_/g, " ")}
              </span>
              <span>•</span>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1" aria-hidden="true" />
                <span className="font-medium text-slate-700">
                  {lead.rating || "N/A"}
                </span>
                <span className="ml-1">({lead.userRatingCount || 0})</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-slate-700">{lead.address}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
                {lead.nationalPhoneNumber ? (
                  <a
                    href={`tel:${lead.nationalPhoneNumber}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {lead.nationalPhoneNumber}
                  </a>
                ) : (
                  <span className="text-sm text-slate-500 italic">
                    Não informado
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
                {lead.websiteUri ? (
                  <a
                    href={lead.websiteUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate"
                  >
                    {lead.websiteUri}
                  </a>
                ) : (
                  <span className="text-sm text-slate-500 italic">
                    Sem website
                  </span>
                )}
              </div>

              {lead.googleMapsUri && (
                <div className="pt-4 mt-4 border-t border-slate-100/60">
                  <a
                    href={lead.googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline flex items-center"
                  >
                    Abrir no Google Maps{" "}
                    <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-xl border border-slate-800 p-6 text-white shadow-lg"
          >
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
              Digital Pain Score
            </h3>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-5xl font-bold tracking-tighter text-gradient">
                {lead.digitalPainScore}
              </span>
              <span className="text-slate-400 mb-1">/ 100</span>
            </div>

            {/* Animated progress bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${lead.digitalPainScore}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </div>

            <p className="text-sm text-slate-300">
              {lead.digitalPainScore > 60
                ? "Alta oportunidade. Fortes deficiências digitais encontradas."
                : lead.digitalPainScore > 30
                  ? "Oportunidade média. Algumas melhorias necessárias."
                  : "Baixa oportunidade. Presença digital sólida."}
            </p>
          </motion.div>
        </div>

        {/* Right Column: AI Report */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="glass-card rounded-xl p-8 shadow-md min-h-[600px]"
          >
            {isLoading ? (
              <div
                className="flex flex-col items-center justify-center h-full space-y-4 text-slate-600 py-20"
                role="status"
                aria-live="polite"
              >
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-blue-100 rounded-full" />
                  <div className="absolute inset-0 w-10 h-10 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium text-slate-700">
                    Analisando {lead.name}...
                  </p>
                  <p className="text-sm text-slate-400">
                    Gerando relatorio estrategico (estimado: 15-20s)
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-rose-500 py-20">
                <AlertCircle className="w-12 h-12" aria-hidden="true" />
                <p className="font-medium">{error}</p>
                <Button variant="outline" onClick={() => retry()}>
                  Tentar Novamente
                </Button>
              </div>
            ) : report ? (
              <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-xl prose-h2:font-bold prose-h2:border-b prose-h2:pb-2 prose-h2:mt-8 first:prose-h2:mt-0 prose-p:text-slate-600 prose-li:text-slate-600">
                <div className="markdown-body">
                  <Markdown rehypePlugins={[rehypeSanitize]}>
                    {report}
                  </Markdown>
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
