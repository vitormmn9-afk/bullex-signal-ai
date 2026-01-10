import { useState, useEffect, useCallback } from "react";
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

export function useSignals(marketType: "OTC" | "OPEN") {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchSignals = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .eq("market_type", marketType)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setSignals((data as Signal[]) || []);
    } catch (error) {
      console.error("Error fetching signals:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar sinais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [marketType, toast]);

  const generateSignal = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke("generate-signal", {
        body: {
          marketType,
          assets: ASSETS[marketType],
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate signal");
      }

      const newSignal = response.data as Signal;
      setSignals((prev) => [newSignal, ...prev]);

      toast({
        title: "Sinal Gerado!",
        description: `${newSignal.asset} - ${newSignal.direction} (${newSignal.probability}%)`,
      });

      return newSignal;
    } catch (error: any) {
      console.error("Error generating signal:", error);
      toast({
        title: "Erro ao gerar sinal",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [marketType, toast]);

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

        toast({
          title: result === "WIN" ? "Vitória registrada!" : "Perda registrada",
          description: "O resultado foi salvo para aprendizado da IA",
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
    [toast]
  );

  // Real-time subscription
  useEffect(() => {
    fetchSignals();

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
            setSignals((prev) => [payload.new as Signal, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setSignals((prev) =>
              prev.map((s) => (s.id === payload.new.id ? (payload.new as Signal) : s))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketType, fetchSignals]);

  // Calculate stats
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
    isGenerating,
    generateSignal,
    updateSignalResult,
    refetch: fetchSignals,
  };
}
