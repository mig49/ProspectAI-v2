"use client";

import { useState } from "react";
import { PORTUGAL_DISTRICTS } from "@/lib/constants";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { SearchParams } from "@/types";
import { Search, MapPin, Target, Briefcase } from "lucide-react";
import { motion } from "motion/react";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [icp, setIcp] = useState("");
  const [service, setService] = useState("");
  const [state, setState] = useState("Lisboa");
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ icp, service, state, city });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-2xl mx-auto glass-card p-8 rounded-2xl shadow-xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Encontre seus próximos clientes
        </h2>
        <p className="text-slate-600">
          A IA do ProspectAI encontra e qualifica leads baseados no seu serviço.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <span className="bg-blue-50 rounded-md p-1">
              <Target className="w-4 h-4 text-blue-600" aria-hidden="true" />
            </span>
            Descreva seu ICP (Perfil de Cliente Ideal)
          </label>
          <Textarea
            required
            value={icp}
            onChange={(e) => setIcp(e.target.value)}
            placeholder="Ex: Clínicas odontológicas com 3+ anos, faturamento médio, presença digital fraca"
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <span className="bg-blue-50 rounded-md p-1">
              <Briefcase className="w-4 h-4 text-blue-600" aria-hidden="true" />
            </span>
            Qual serviço você oferece?
          </label>
          <Textarea
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Ex: Sistemas de IA para automação de atendimento e agendamento via WhatsApp"
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <span className="bg-blue-50 rounded-md p-1">
                <MapPin className="w-4 h-4 text-blue-600" aria-hidden="true" />
              </span>
              Distrito
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200/80 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-300 transition-all duration-200"
            >
              <option value="Todo Portugal">Todo Portugal</option>
              {PORTUGAL_DISTRICTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              Cidade (Opcional)
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Lisboa"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Buscando Leads...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Buscar Leads
              </span>
            )}
          </Button>
          <p className="text-center text-xs text-slate-500 mt-3">
            Busca alimentada pelo Google Maps via Gemini AI (Gratuito)
          </p>
        </div>
      </form>
    </motion.div>
  );
}
