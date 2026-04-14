import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { reportParamsSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getRateLimitIdentifier, rateLimitHeaders } from "@/lib/rate-limit";
import { checkUsageLimit, incrementUsage, paywallResponse } from "@/lib/subscription";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const GEMINI_TIMEOUT_MS = 60_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), ms)
    ),
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const identifier = await getRateLimitIdentifier(request);
    const rl = rateLimit(identifier, RATE_LIMIT, RATE_WINDOW_MS);

    if (!rl.success) {
      return NextResponse.json(
        { error: "Limite de requisicoes excedido. Tente novamente em breve." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Autenticacao necessaria." },
        { status: 401 }
      );
    }

    // Paywall: check report usage limits
    const usageCheck = await checkUsageLimit(user.id, "reports");
    if (!usageCheck.allowed) {
      return NextResponse.json(
        paywallResponse("reports", usageCheck.plan, usageCheck.used, usageCheck.limit),
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = reportParamsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parametros invalidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { leadId, lead, service, forceRegenerate } = parsed.data;

    // Ownership check + cache lookup in single query
    const { data: ownedLead } = await supabase
      .from("leads")
      .select("id, detailed_report")
      .eq("external_id", leadId)
      .eq("user_id", user.id)
      .single();

    if (!ownedLead) {
      return NextResponse.json(
        { error: "Acesso negado. Este lead nao pertence ao seu usuario." },
        { status: 403 }
      );
    }

    // Return cached report if available and not forcing regeneration
    if (ownedLead.detailed_report && !forceRegenerate) {
      return NextResponse.json(
        { report: ownedLead.detailed_report, cached: true },
        { headers: rateLimitHeaders(rl) }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY nao configurada no servidor." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const reportPrompt = `
      Voce e um consultor de vendas B2B especialista em IA.
      O usuario esta tentando vender o seguinte servico: "${service}".

      Aqui estao os dados do lead (empresa):
      Nome: ${lead.name}
      Endereco: ${lead.address}
      Avaliacao: ${lead.rating} (${lead.userRatingCount} avaliacoes)
      Website: ${lead.websiteUri ? "Sim" : "Nao"}
      Telefone: ${lead.nationalPhoneNumber ? "Sim" : "Nao"}
      Tipos: ${lead.types?.join(", ")}

      Avaliacoes recentes:
      ${lead.reviews?.map((r: any) => `- ${r.rating} estrelas: "${r.text?.text}"`).join("\n") || "Nenhuma avaliacao detalhada disponivel."}

      Gere um relatorio de oportunidade de vendas completo em formato Markdown (pt-BR).
      O relatorio DEVE conter as seguintes secoes (use headers h2 ##):

      ## Diagnostico Digital
      (Analise o que esta faltando ou fraco na presenca online deles com base nos dados acima)

      ## Analise de Avaliacoes
      (Resumo do sentimento das avaliacoes e reclamacoes comuns, se houver)

      ## Por que esta empresa precisa de IA
      (Conecte as dores especificas deles com o servico de IA oferecido pelo usuario)

      ## Abordagem de Vendas Sugerida
      (Como o usuario deve abordar este lead, o que dizer na primeira mensagem/ligacao)

      ## Impacto Estimado
      (O que a IA poderia melhorar para eles em termos de negocios/faturamento/tempo)
    `;

    const reportResponse = await withTimeout(
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: reportPrompt,
      }),
      GEMINI_TIMEOUT_MS
    );

    const report = reportResponse.text || "Relatorio nao gerado.";

    // Increment usage counter
    await incrementUsage(user.id, "reports");

    // Save to cache (non-blocking)
    supabase
      .from("leads")
      .update({ detailed_report: report })
      .eq("id", ownedLead.id)
      .then(() => {});

    return NextResponse.json(
      { report, cached: false },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (err: any) {
    if (err.message === "TIMEOUT") {
      return NextResponse.json(
        { error: "A geracao do relatorio excedeu o tempo limite de 60 segundos. Tente novamente." },
        { status: 504 }
      );
    }
    console.error("Report API error:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao gerar relatorio." },
      { status: 500 }
    );
  }
}
