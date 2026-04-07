import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { searchParamsSchema, leadsArraySchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getRateLimitIdentifier, rateLimitHeaders } from "@/lib/rate-limit";

const RATE_LIMIT = 10;
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

    const body = await request.json();
    const parsed = searchParamsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parametros de busca invalidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { icp, service, state, city } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY nao configurada no servidor." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const locationStr = city ? `${city}, ${state}, Portugal` : `${state}, Portugal`;

    const prompt = `
      Voce e um especialista em prospeccao B2B.
      O usuario esta procurando por leads com o seguinte Perfil de Cliente Ideal (ICP): "${icp}".
      A localizacao alvo e: "${locationStr}".
      O usuario oferece o seguinte servico: "${service}".

      Use o Google Maps para encontrar ate 50 negocios reais que correspondam a este ICP nesta localizacao.

      Para cada negocio encontrado, forneca os seguintes dados em formato JSON estrito (uma array de objetos):
      [
        {
          "id": "um identificador unico gerado por voce",
          "name": "Nome do negocio",
          "address": "Endereco completo",
          "city": "Cidade",
          "state": "Distrito",
          "rating": 4.5,
          "userRatingCount": 120,
          "primaryType": "Categoria principal",
          "nationalPhoneNumber": "Telefone se disponivel, ou null",
          "websiteUri": "Website se disponivel, ou null",
          "googleMapsUri": "Link do Google Maps se disponivel, ou null",
          "digitalPainScore": um numero de 0 a 100 (onde 100 e a maior oportunidade para vender o servico. De pontos por falta de site, poucas fotos, nota baixa, poucas avaliacoes, sem telefone, etc),
          "aiSummary": "Resumo de oportunidade de no maximo 3 linhas em portugues (pt-BR), explicando por que este negocio e um bom lead para o servico oferecido."
        }
      ]

      Retorne APENAS o JSON valido, sem blocos de codigo markdown (\`\`\`json) e sem texto adicional.
    `;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          temperature: 0.2,
        },
      }),
      GEMINI_TIMEOUT_MS
    );

    let text = response.text || "[]";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let searchResults = [];
    try {
      searchResults = JSON.parse(text);
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        searchResults = JSON.parse(match[0]);
      } else {
        return NextResponse.json(
          { error: "Resposta invalida do Gemini. Tente novamente." },
          { status: 502 }
        );
      }
    }

    // Enrich with grounding chunks (Google Maps URIs)
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.maps?.uri && chunk.maps?.title) {
          const matchedResult = searchResults.find(
            (r: any) =>
              r.name.toLowerCase().includes(chunk.maps.title.toLowerCase()) ||
              chunk.maps.title.toLowerCase().includes(r.name.toLowerCase())
          );
          if (matchedResult && !matchedResult.googleMapsUri) {
            matchedResult.googleMapsUri = chunk.maps.uri;
          }
        }
      });
    }

    // Validate and sort
    const validated = leadsArraySchema.safeParse(searchResults);
    const leads = validated.success ? validated.data : searchResults;
    leads.sort((a: any, b: any) => (b.digitalPainScore || 0) - (a.digitalPainScore || 0));

    // Persist to Supabase (non-blocking)
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: searchRecord } = await supabase
          .from("searches")
          .insert({
            user_id: user.id,
            icp,
            service,
            district: state,
            city: city || "",
            results_count: leads.length,
          })
          .select("id")
          .single();

        if (searchRecord?.id && leads.length > 0) {
          const leadsToInsert = leads.map((l: any) => ({
            search_id: searchRecord.id,
            user_id: user.id,
            external_id: l.id,
            name: l.name,
            address: l.address || "",
            city: l.city || "",
            district: l.state || "",
            rating: l.rating,
            user_rating_count: l.userRatingCount || 0,
            primary_type: l.primaryType || "",
            phone: l.nationalPhoneNumber || null,
            website: l.websiteUri || null,
            google_maps_uri: l.googleMapsUri || null,
            digital_pain_score: l.digitalPainScore || 0,
            ai_summary: l.aiSummary || "",
          }));
          await supabase.from("leads").insert(leadsToInsert);
        }
      }
    } catch (dbErr) {
      console.error("Supabase persist error (non-blocking):", dbErr);
    }

    return NextResponse.json({ leads }, { headers: rateLimitHeaders(rl) });
  } catch (err: any) {
    if (err.message === "TIMEOUT") {
      return NextResponse.json(
        { error: "A busca excedeu o tempo limite de 60 segundos. Tente novamente com uma area menor." },
        { status: 504 }
      );
    }
    console.error("Prospect API error:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
