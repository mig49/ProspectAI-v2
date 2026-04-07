import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { reportParamsSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getRateLimitIdentifier, rateLimitHeaders } from "@/lib/rate-limit";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

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

    const body = await request.json();
    const parsed = reportParamsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parametros invalidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { leadId, lead, service } = parsed.data;

    const { data: ownedLead } = await supabase
      .from("leads")
      .select("id")
      .eq("external_id", leadId)
      .eq("user_id", user.id)
      .single();

    if (!ownedLead) {
      return NextResponse.json(
        { error: "Acesso negado. Este lead nao pertence ao seu usuario." },
        { status: 403 }
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

    const reportResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: reportPrompt,
    });

    const report = reportResponse.text || "Relatorio nao gerado.";

    return NextResponse.json({ report }, { headers: rateLimitHeaders(rl) });
  } catch (err: any) {
    console.error("Report API error:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao gerar relatorio." },
      { status: 500 }
    );
  }
}
