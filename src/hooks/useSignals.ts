import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { performComprehensiveAnalysis } from "@/lib/technicalAnalysis";
import { aiLearningSystem, type SignalHistory } from "@/lib/aiLearning";

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
  analysisMetrics?: any;
  candlePattern?: string;
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

// Minimum probability threshold is adjustable via state (default 90%)

function generateAIReasoning(analysis: any, learningState: any): string {
  const reasons = [];
  
  if (analysis.rsi > 70 || analysis.rsi < 30) {
    reasons.push(`RSI ${analysis.rsi.toFixed(1)} (extremo)`);
  }
  if (Math.abs(analysis.macd) > 0.5) {
    reasons.push(`MACD forte (${analysis.macd.toFixed(2)})`);
  }
  if (analysis.bbands > 80 || analysis.bbands < 20) {
    reasons.push(`Bollinger Band (${analysis.bbands.toFixed(1)})`);
  }
  if (analysis.candlePattern.strength > 0.7) {
    reasons.push(`Padrão ${analysis.candlePattern.name}`);
  }
  if (analysis.trendStrength > 60) {
    reasons.push(`Tendência forte (${analysis.trendStrength.toFixed(1)})`);
  }
  if (learningState.winRate > 50) {
    reasons.push(`Padrão em alta (${learningState.winRate.toFixed(1)}%)`);
  }
  
  return reasons.length > 0 ? reasons.join(" + ") : "Análise multifatorial";
}
export function useSignals(marketType: "OTC" | "OPEN", autoGenerate: boolean = true) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(false); // Start disabled
  const [minProbability, setMinProbability] = useState<number>(90);
  const { toast } = useToast();

  const fetchSignals = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data for development - database connectivity issues
      const assetsForMarket = ASSETS[marketType];
      const mockSignals: Signal[] = [
        {
          id: "mock-1",
          asset: assetsForMarket[0], // First asset from the selected market
          direction: "CALL",
          probability: 92,
          market_type: marketType,
          expiration_time: 60, // 1 minute candle
          indicators_used: ["RSI", "MACD", "Bollinger Bands"],
          ai_reasoning: "Strong uptrend with support confirmation",
          result: "WIN",
          created_at: new Date().toISOString(),
          executed_at: new Date().toISOString(),
        },
        {
          id: "mock-2",
          asset: assetsForMarket[1], // Second asset from the selected market
          direction: "PUT",
          probability: 94,
          market_type: marketType,
          expiration_time: 60, // 1 minute candle
          indicators_used: ["RSI", "Stochastic"],
          ai_reasoning: "Overbought conditions detected",
          result: null,
          created_at: new Date().toISOString(),
          executed_at: null,
        },
      ];

      // Apply minimum probability filter
      setSignals(mockSignals.filter(s => s.probability >= minProbability));
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
  }, [marketType]);

  const generateSignal = useCallback(async () => {
    if (isGenerating) return null; // Prevent concurrent generations
    
    setIsGenerating(true);
    try {
      // Simulate price data for analysis
      const mockPrices = Array.from({ length: 50 }, () => 
        100 + (Math.random() - 0.5) * 10
      );
      
      // Perform comprehensive technical analysis
      const analysis = performComprehensiveAnalysis(mockPrices);
      
      // Get AI learning system insights
      const learningState = aiLearningSystem.getLearningState();
      const bestIndicators = learningState.bestIndicators.length > 0 
        ? learningState.bestIndicators 
        : ["RSI", "MACD", "Bollinger Bands"];
      
      // Calculate adaptive probability based on learning
      const baseScore = analysis.overallScore;
      const candlePatternName = analysis.candlePattern.name;
      let adaptiveProbability = aiLearningSystem.getAdaptiveProbability(
        baseScore,
        candlePatternName,
        bestIndicators
      );

      // Enforce minimum probability threshold
      if (adaptiveProbability < minProbability) {
        // If auto mode is enabled, schedule a retry; otherwise inform user
        if (autoGenerateEnabled) {
          // Try again shortly without flooding (only one pending retry)
          if (retryTimeoutRef.current == null) {
            retryTimeoutRef.current = window.setTimeout(() => {
              retryTimeoutRef.current = null;
              generateSignalRef.current();
            }, 10000); // 10s retry
          }
        } else {
          toast({
            title: `Sem oportunidade ≥ ${minProbability}%`,
            description: "Nenhum sinal com alta confiança no momento.",
          });
        }
        return null;
      }
      
      // Determine direction based on analysis
      const direction: "CALL" | "PUT" = 
        analysis.priceAction > 60 && analysis.rsi < 70 ? "CALL" : "PUT";
      
      // Calculate entry time: current time + 60 seconds (1 minute from now)
      const now = new Date();
      const entryTime = new Date(now.getTime() + 60000); // +1 minute
      
      // Round entry time to the next full minute
      entryTime.setSeconds(0);
      entryTime.setMilliseconds(0);
      if (now.getSeconds() > 0) {
        entryTime.setMinutes(entryTime.getMinutes() + 1);
      }
      
      const signalId = `mock-${Date.now()}`;
      const mockNewSignal: Signal = {
        id: signalId,
        asset: ASSETS[marketType][Math.floor(Math.random() * ASSETS[marketType].length)],
        direction: direction,
        probability: adaptiveProbability,
        market_type: marketType,
        expiration_time: 60, // Always 60 seconds (1 minute candle)
        indicators_used: bestIndicators,
        ai_reasoning: generateAIReasoning(analysis, learningState),
        result: null,
        created_at: new Date().toISOString(),
        executed_at: null,
        analysisMetrics: analysis,
        candlePattern: candlePatternName,
      };

      setSignals((prev) => [mockNewSignal, ...prev]);

      // Record signal in learning system
      aiLearningSystem.recordSignal({
        id: signalId,
        asset: mockNewSignal.asset,
        direction: mockNewSignal.direction,
        probability: mockNewSignal.probability,
        analysisMetrics: {
          rsi: analysis.rsi,
          macd: analysis.macd,
          bbands: analysis.bbands,
          candlePattern: candlePatternName,
          quadrantScore: analysis.quadrantScore,
          priceAction: analysis.priceAction,
          volumeProfile: analysis.volumeProfile,
          trendStrength: analysis.trendStrength,
          supportResistance: analysis.supportResistance,
          overallScore: analysis.overallScore,
        },
        result: null,
        timestamp: Date.now(),
      });

      const entryTimeStr = entryTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      toast({
        title: "🤖 IA Gerou Sinal!",
        description: `${mockNewSignal.asset} - ${mockNewSignal.direction} (${mockNewSignal.probability}%)\nEntre na vela de ${entryTimeStr}\nFase de Evolução: ${learningState.evolutionPhase} | Taxa: ${learningState.winRate.toFixed(1)}%`,
      });

      return mockNewSignal;
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
  }, [marketType, isGenerating]);

  const updateSignalResult = useCallback(
    async (signalId: string, result: "WIN" | "LOSS") => {
      try {
        // Mock update for development
        setSignals((prev) =>
          prev.map((s) =>
            s.id === signalId ? { ...s, result, executed_at: new Date().toISOString() } : s
          )
        );

        // Update AI learning system
        aiLearningSystem.updateSignalResult(signalId, result);
        
        const learningState = aiLearningSystem.getLearningState();

        toast({
          title: result === "WIN" ? "✅ Vitória registrada!" : "❌ Perda registrada",
          description: `IA em evolução | Taxa: ${learningState.winRate.toFixed(1)}% | Fase: ${learningState.evolutionPhase}`,
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
    []
  );

  // Use ref to store latest generateSignal function
  const generateSignalRef = useRef(generateSignal);
  generateSignalRef.current = generateSignal;
  const retryTimeoutRef = useRef<number | null>(null);

  // Fetch signals on component mount and market type change
  useEffect(() => {
    fetchSignals();
  }, [marketType]);

  // Auto-generate signals every 5 minutes
  useEffect(() => {
    if (!autoGenerateEnabled) return;

    // Generate a signal immediately (with small delay to prevent race conditions)
    const timeoutId = setTimeout(() => {
      generateSignalRef.current();
    }, 500);

    // Set up interval to generate signals every 5 minutes (300 seconds)
    const autoGenerateInterval = setInterval(() => {
      generateSignalRef.current();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearTimeout(timeoutId);
      clearInterval(autoGenerateInterval);
      if (retryTimeoutRef.current != null) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [autoGenerateEnabled]);

  // Check for signals - notify immediately when created (1 minute before entry)
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      const now = Date.now();
      
      signals.forEach((signal) => {
        if (signal.result === null) {
          const createdTime = new Date(signal.created_at).getTime();
          const timeSinceCreation = now - createdTime;
          
          // Notify within the first 5 seconds of signal creation
          if (timeSinceCreation > 0 && timeSinceCreation < 5000) {
            const hasNotified = sessionStorage.getItem(`notified-${signal.id}`);
            if (!hasNotified) {
              sessionStorage.setItem(`notified-${signal.id}`, "true");

              // Calculate entry time (next full minute)
              const entryTime = new Date(createdTime + 60000);
              entryTime.setSeconds(0);
              entryTime.setMilliseconds(0);
              const currentTime = new Date(createdTime);
              if (currentTime.getSeconds() > 0) {
                entryTime.setMinutes(entryTime.getMinutes() + 1);
              }
              
              const entryTimeStr = entryTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const exitTimeStr = new Date(entryTime.getTime() + 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

              toast({
                title: "⏰ HORA DE ENTRAR!",
                description: `${signal.asset} - ${signal.direction}\nEntre na vela de ${entryTimeStr}\nSai em ${exitTimeStr}\nProbabilidade: ${signal.probability}%`,
                variant: "default",
                duration: 50000, // Show for 50 seconds
              });

              // Play notification sound
              try {
                const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj==");
                audio.play().catch(() => {});
              } catch (e) {
                console.log("Could not play notification sound");
              }
            }
          }
        }
      });
    }, 1000); // Check every second

    return () => clearInterval(notificationInterval);
  }, [signals]);

  // Calculate stats (only for high-confidence signals ≥ minProbability)
  const highConfidenceSignals = signals.filter((s) => Number(s.probability) >= minProbability);
  const completedHighConfidence = highConfidenceSignals.filter((s) => s.result === "WIN" || s.result === "LOSS");
  const winsHC = highConfidenceSignals.filter((s) => s.result === "WIN").length;
  const lossesHC = highConfidenceSignals.filter((s) => s.result === "LOSS").length;

  const stats = {
    total: highConfidenceSignals.length,
    wins: winsHC,
    losses: lossesHC,
    pending: highConfidenceSignals.filter((s) => s.result === "PENDING" || !s.result).length,
    accuracy:
      completedHighConfidence.length > 0
        ? ((winsHC / completedHighConfidence.length) * 100).toFixed(1)
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
    autoGenerateEnabled,
    setAutoGenerateEnabled,
    minProbability,
    setMinProbability,
  };
}
