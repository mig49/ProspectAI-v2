"use client";

import { useState } from "react";
import { PORTUGAL_DISTRICTS } from "@/lib/constants";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { SearchParams } from "@/types";
import { Search, MapPin, Target, Briefcase } from "lucide-react";

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
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Encontre seus próximos clientes
        </h2>
        <p className="text-slate-600">
          A IA do ProspectAI encontra e qualifica leads baseados no seu serviço.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" aria-hidden="true" />
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
            <Briefcase className="w-4 h-4 text-blue-500" aria-hidden="true" />
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
              <MapPin className="w-4 h-4 text-blue-500" aria-hidden="true" />
              Distrito
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
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
            <label className="text-sm font-medium text-slate-700">
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
          <p className="text-center text-xs text-slate-600 mt-3">
            Busca alimentada pelo Google Maps via Gemini AI (Gratuito)
          </p>
        </div>
      </form>
    </div>
  );
}
