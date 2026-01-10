import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Signal {
  id: string;
  asset: string;
  direction: "CALL" | "PUT";
  probability: number;
  market_type: "OTC" | "OPEN";
  expiration_time: number;
  indicators_used: string[] | null;
  ai_reasoning: string | null;
  result: "WIN" | "LOSS" | "PENDING" | null;
  created_at: string;
  executed_at: string | null;
  entry_time: string | null;
}

const ASSETS = {
  OPEN: [
    "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD",
    "EUR/GBP", "EUR/JPY", "GBP/JPY", "NZD/USD", "USD/CHF"
  ],
  OTC: [
    "EUR/USD OTC", "GBP/USD OTC", "USD/JPY OTC", "AUD/USD OTC",
    "EUR/GBP OTC", "GBP/JPY OTC", "NZD/USD OTC", "USD/CAD OTC"
  ],
};

// Intervalo de geração automática em milissegundos (30 segundos)
const AUTO_GENERATION_INTERVAL = 30000;
// Probabilidade mínima para gerar sinal (75%)
const MIN_PROBABILITY_THRESHOLD = 75;

export function useAutoSignals(marketType: "OTC" | "OPEN") {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [lastSignalTime, setLastSignalTime] = useState<Date | null>(null);
  const [aiLearningData, setAiLearningData] = useState<any>(null);
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);
  const isGeneratingRef = useRef(false);

  // Buscar sinais do banco de dados
  const fetchSignals = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .eq("market_type", marketType)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
        setSignals((data as any[]) || []);
    } catch (error) {
      console.error("Error fetching signals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [marketType]);

  // Analisar padrões de aprendizado da IA
  const analyzeMarketPatterns = useCallback(async () => {
    try {
      const { data: recentSignals } = await supabase
        .from("signals")
        .select("*")
        .not("result", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!recentSignals || recentSignals.length === 0) {
        return null;
      }

        const winningSignals = recentSignals.filter(s => s.result === "WIN") as any[];
        const losingSignals = recentSignals.filter(s => s.result === "LOSS") as any[];

      // Análise de padrões de sucesso
      const successPatterns = {
        bestAssets: getMostSuccessfulAssets(winningSignals),
        bestDirection: getBestDirection(winningSignals),
        bestIndicators: getMostSuccessfulIndicators(winningSignals),
        timePatterns: getTimePatterns(winningSignals),
        winRate: (winningSignals.length / recentSignals.length * 100).toFixed(1),
        avgWinProbability: calculateAverage(winningSignals.map(s => s.probability)),
        avgLossProbability: calculateAverage(losingSignals.map(s => s.probability)),
      };

      setAiLearningData(successPatterns);
      return successPatterns;
    } catch (error) {
      console.error("Error analyzing patterns:", error);
      return null;
    }
  }, []);

  // Gerar sinal automaticamente com IA
  const generateAutoSignal = useCallback(async () => {
    if (isGeneratingRef.current) return;
    
    isGeneratingRef.current = true;
    try {
      // Analisar padrões antes de gerar
      const patterns = await analyzeMarketPatterns();

      const response = await supabase.functions.invoke("generate-signal", {
        body: {
          marketType,
          assets: ASSETS[marketType],
          learningData: patterns,
          autoMode: true,
          minProbability: MIN_PROBABILITY_THRESHOLD,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate signal");
      }

      const newSignal = response.data as Signal;

      // Só adiciona sinal se a probabilidade for alta o suficiente
      if (newSignal.probability >= MIN_PROBABILITY_THRESHOLD) {
        setSignals((prev) => [newSignal, ...prev]);
        setLastSignalTime(new Date());

        toast({
          title: "✨ Novo Sinal Automático!",
          description: `${newSignal.asset} - ${newSignal.direction} (${newSignal.probability}%)`,
          duration: 5000,
        });
      }

      return newSignal;
    } catch (error: any) {
      console.error("Error generating auto signal:", error);
      
      // Não mostrar erro para o usuário em modo automático
      // apenas logar no console
      if (!error.message?.includes("Rate limit") && !error.message?.includes("Payment")) {
        console.warn("Auto-signal generation paused due to error");
      }
      return null;
    } finally {
      isGeneratingRef.current = false;
    }
  }, [marketType, toast, analyzeMarketPatterns]);

  // Atualizar resultado do sinal
  const updateSignalResult = useCallback(
    async (signalId: string, result: "WIN" | "LOSS") => {
      try {
        const { error } = await supabase
          .from("signals")
          .update({ result, executed_at: new Date().toISOString() })
          .eq("id", signalId);

        if (error) throw error;

        setSignals((prev) =>
          prev.map((s) =>
            s.id === signalId ? { ...s, result, executed_at: new Date().toISOString() } : s
          )
        );

        // Reanalizar padrões após atualização
        await analyzeMarketPatterns();

        toast({
          title: result === "WIN" ? "✅ Vitória registrada!" : "❌ Perda registrada",
          description: "A IA está aprendendo com esse resultado",
        });
      } catch (error) {
        console.error("Error updating signal:", error);
        toast({
          title: "Erro",
          description: "Falha ao atualizar resultado",
          variant: "destructive",
        });
      }
    },
    [toast, analyzeMarketPatterns]
  );

  // Controlar modo automático
  const toggleAutoMode = useCallback(() => {
    setIsAutoMode((prev) => {
      const newMode = !prev;
      toast({
        title: newMode ? "🤖 Modo Automático Ativado" : "⏸️ Modo Automático Pausado",
        description: newMode 
          ? "A IA gerará sinais automaticamente" 
          : "Geração automática pausada",
      });
      return newMode;
    });
  }, [toast]);

  // Sistema de polling automático
  useEffect(() => {
    if (isAutoMode) {
      // Gerar primeiro sinal imediatamente
      generateAutoSignal();

      // Configurar intervalo para geração contínua
      intervalRef.current = setInterval(() => {
        generateAutoSignal();
      }, AUTO_GENERATION_INTERVAL) as any;

      toast({
        title: "🚀 Sistema Iniciado",
        description: `Gerando sinais automáticos a cada ${AUTO_GENERATION_INTERVAL / 1000}s`,
        duration: 3000,
      });
    } else {
      // Limpar intervalo quando desativado
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoMode, generateAutoSignal, toast]);

  // Subscription em tempo real
  useEffect(() => {
    fetchSignals();
    analyzeMarketPatterns();

    const channel = supabase
      .channel("signals-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "signals",
          filter: `market_type=eq.${marketType}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newSignal = payload.new as Signal;
            if (newSignal.probability >= MIN_PROBABILITY_THRESHOLD) {
              setSignals((prev) => [newSignal, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setSignals((prev) =>
              prev.map((s) => (s.id === payload.new.id ? (payload.new as Signal) : s))
            );
            // Reanalizar padrões quando um resultado é atualizado
            if (payload.new.result !== payload.old?.result) {
              analyzeMarketPatterns();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketType, fetchSignals, analyzeMarketPatterns]);

  // Calcular estatísticas
  const stats = {
    total: signals.length,
    wins: signals.filter((s) => s.result === "WIN").length,
    losses: signals.filter((s) => s.result === "LOSS").length,
    pending: signals.filter((s) => s.result === "PENDING" || !s.result).length,
    accuracy:
      signals.filter((s) => s.result === "WIN" || s.result === "LOSS").length > 0
        ? (
            (signals.filter((s) => s.result === "WIN").length /
              signals.filter((s) => s.result === "WIN" || s.result === "LOSS").length) *
            100
          ).toFixed(1)
        : "N/A",
  };

  return {
    signals,
    stats,
    isLoading,
    isAutoMode,
    lastSignalTime,
    aiLearningData,
    toggleAutoMode,
    updateSignalResult,
    generateManualSignal: generateAutoSignal,
    refetch: fetchSignals,
  };
}

// Funções auxiliares para análise de padrões

function getMostSuccessfulAssets(signals: Signal[]): string[] {
  const assetCounts: { [key: string]: number } = {};
  signals.forEach(s => {
    assetCounts[s.asset] = (assetCounts[s.asset] || 0) + 1;
  });
  return Object.entries(assetCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([asset]) => asset);
}

function getBestDirection(signals: Signal[]): { CALL: number; PUT: number } {
  const calls = signals.filter(s => s.direction === "CALL").length;
  const puts = signals.filter(s => s.direction === "PUT").length;
  return { CALL: calls, PUT: puts };
}

function getMostSuccessfulIndicators(signals: Signal[]): string[] {
  const indicatorCounts: { [key: string]: number } = {};
  signals.forEach(s => {
    s.indicators_used?.forEach(indicator => {
      indicatorCounts[indicator] = (indicatorCounts[indicator] || 0) + 1;
    });
  });
  return Object.entries(indicatorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([indicator]) => indicator);
}

function getTimePatterns(signals: Signal[]): { hour: number; count: number }[] {
  const hourCounts: { [key: number]: number } = {};
  signals.forEach(s => {
    const hour = new Date(s.created_at).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  return Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
}
