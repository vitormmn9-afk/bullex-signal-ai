import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { marketType, assets } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get recent performance data for AI learning context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: recentSignals } = await supabase
      .from("signals")
      .select("*")
      .not("result", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);

    const winRate = recentSignals?.length 
      ? (recentSignals.filter(s => s.result === "WIN").length / recentSignals.length * 100).toFixed(1)
      : "N/A";

    const successPatterns = recentSignals?.filter(s => s.result === "WIN").map(s => ({
      asset: s.asset,
      direction: s.direction,
      probability: s.probability,
      indicators: s.indicators_used
    })) || [];

    const systemPrompt = `Você é uma IA especializada em análise de mercado de opções binárias para a corretora Bullex.
Seu objetivo é gerar sinais de alta precisão baseados em múltiplos indicadores e padrões de mercado.

CONTEXTO DE APRENDIZADO:
- Taxa de acerto histórica: ${winRate}%
- Padrões de sucesso recentes: ${JSON.stringify(successPatterns.slice(0, 5))}

INDICADORES QUE VOCÊ DEVE ANALISAR:
- RSI (Relative Strength Index) - sobrecompra/sobrevenda
- MACD (Moving Average Convergence Divergence) - momentum e tendência
- Bandas de Bollinger - volatilidade e reversões
- Médias Móveis (EMA 9, EMA 21, SMA 50) - tendência
- Suporte e Resistência - níveis chave
- Volume - confirmação de movimentos
- Padrões de Candlestick - doji, engolfo, martelo, etc.
- Fibonacci Retracement - níveis de correção
- Stochastic Oscillator - momentum

REGRAS PARA GERAR SINAIS:
1. Só gere sinal se pelo menos 3 indicadores confirmarem a direção
2. A probabilidade deve refletir a força da confluência dos indicadores
3. Priorize reversões em níveis de suporte/resistência
4. Evite sinais durante alta volatilidade de notícias
5. Para OTC: considere que a liquidez é menor, seja mais conservador
6. Aprenda com os padrões que tiveram sucesso anteriormente

Responda APENAS em JSON válido com este formato exato:
{
  "asset": "nome do ativo",
  "direction": "CALL" ou "PUT",
  "probability": número entre 65 e 95,
  "expiration_time": 5,
  "indicators_used": ["lista", "de", "indicadores"],
  "reasoning": "explicação técnica breve"
}`;

    const userPrompt = `Analise o mercado ${marketType === "OTC" ? "OTC (Over The Counter)" : "Aberto"} agora.
    
Ativos disponíveis para análise: ${assets.join(", ")}

Com base na sua análise técnica usando todos os indicadores disponíveis, gere o melhor sinal possível com maior probabilidade de acerto.

Lembre-se: Só gere o sinal se você tiver alta confiança baseada em múltiplas confirmações técnicas.`;

    console.log("Requesting AI signal generation for market:", marketType);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI raw response:", content);

    // Parse JSON from response (handle markdown code blocks)
    let signalData;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      signalData = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Invalid AI response format");
    }

    // Save signal to database
    const { data: savedSignal, error: insertError } = await supabase
      .from("signals")
      .insert({
        asset: signalData.asset,
        direction: signalData.direction,
        probability: signalData.probability,
        market_type: marketType,
        expiration_time: signalData.expiration_time || 5,
        indicators_used: signalData.indicators_used,
        ai_reasoning: signalData.reasoning,
        result: "PENDING",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving signal:", insertError);
      throw insertError;
    }

    console.log("Signal saved successfully:", savedSignal.id);

    return new Response(JSON.stringify(savedSignal), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-signal function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
