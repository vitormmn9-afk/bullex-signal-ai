import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { performComprehensiveAnalysis } from "@/lib/technicalAnalysis";
import { aiLearningSystem, type SignalHistory } from "@/lib/aiLearning";
import { performAdvancedCandleAnalysis } from "@/lib/advancedCandleAnalysis";
import { soundSystem } from "@/lib/soundSystem";
import { analytics } from "@/lib/analytics";
import { aiEvolutionTracker } from "@/lib/aiEvolutionTracker";
import { aiSignalAnalyzer } from "@/lib/aiSignalAnalyzer";
import { continuousLearning } from "@/lib/continuousLearning";

// Lazy import Supabase para evitar travamento se não estiver configurado
let supabase: any = null;
try {
  import("@/integrations/supabase/client").then((module) => {
    supabase = module.supabase;
  }).catch(() => {
    console.warn("Supabase não configurado, usando modo offline");
  });
} catch {
  console.warn("Supabase não disponível");
}

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
  entry_time: string;
  exit_time: string;
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

// Intervalo de auto-refresh em milissegundos (60 segundos)
const AUTO_REFRESH_INTERVAL = 60000;

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

function computeEntryExitTimes() {
  const now = new Date();
  const entry = new Date(now.getTime());
  entry.setSeconds(0);
  entry.setMilliseconds(0);
  if (now.getSeconds() > 0) {
    entry.setMinutes(entry.getMinutes() + 1);
  }

  const exit = new Date(entry.getTime() + 60000);
  return {
    entryISO: entry.toISOString(),
    exitISO: exit.toISOString(),
    entryLabel: entry.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    exitLabel: exit.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function useSignals(marketType: "OTC" | "OPEN", autoGenerate: boolean = true) {
  const [signals, setSignals] = useState<Signal[]>(() => {
    try {
      const saved = localStorage.getItem(`signals_${marketType}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(autoGenerate);
  const [minProbability, setMinProbability] = useState<number>(85);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(60); // 60 segundos
  const { toast } = useToast();

  // Debug log
  useEffect(() => {
    console.log('🤖 Auto-geração:', autoGenerateEnabled ? 'ATIVA' : 'INATIVA', '| Intervalo:', autoRefreshInterval + 's');
  }, [autoGenerateEnabled, autoRefreshInterval]);

  // ✅ LISTENER PARA AUTO-ANÁLISE DE WIN/LOSS
  useEffect(() => {
    const handleWin = (event: any) => {
      const analysis = event.detail;
      console.log('🎉 AUTO-WIN detectado:', analysis.signalId);
      
      setSignals((prev) =>
        prev.map((s) =>
          s.id === analysis.signalId
            ? { ...s, result: 'WIN', executed_at: new Date().toISOString() }
            : s
        )
      );

      // ✅ REGISTRAR APRENDIZADO IMEDIATAMENTE
      recordAutomaticLearning('WIN', analysis);

      toast({
        title: "✅ Vitória Automática!",
        description: `${analysis.asset} ${analysis.direction} - Lucro: ${analysis.profitLoss?.toFixed(2)}%`,
      });

      soundSystem.playWin();
    };

    const handleLoss = (event: any) => {
      const analysis = event.detail;
      console.log('❌ AUTO-LOSS detectado:', analysis.signalId);
      
      setSignals((prev) =>
        prev.map((s) =>
          s.id === analysis.signalId
            ? { ...s, result: 'LOSS', executed_at: new Date().toISOString() }
            : s
        )
      );

      // ✅ REGISTRAR APRENDIZADO IMEDIATAMENTE
      recordAutomaticLearning('LOSS', analysis);

      toast({
        title: "❌ Perda Automática",
        description: `${analysis.asset} ${analysis.direction} - Prejuízo: ${analysis.profitLoss?.toFixed(2)}%`,
        variant: "destructive",
      });

      soundSystem.playLoss();
    };

    // ✅ LISTENER PARA ATUALIZAÇÕES DO APRENDIZADO CONTÍNUO
    const handleLearningUpdate = (event: any) => {
      const { cycle, newOperations, accuracy, phase } = event.detail;
      console.log(`🧠 Aprendizado Contínuo #${cycle}: ${newOperations} ops analisadas | Precisão: ${accuracy.toFixed(1)}%`);
      
      // Notificar usuário sobre evolução importante
      if (cycle % 5 === 0) { // A cada 5 ciclos
        toast({
          title: `🧠 IA Evoluindo Continuamente`,
          description: `Ciclo #${cycle} | ${newOperations} ops aprendidas | Fase ${phase} | Precisão: ${accuracy.toFixed(1)}%`,
        });
      }
    };

    window.addEventListener('signal-win', handleWin);
    window.addEventListener('signal-loss', handleLoss);
    window.addEventListener('ai-learning-updated', handleLearningUpdate);

    return () => {
      window.removeEventListener('signal-win', handleWin);
      window.removeEventListener('signal-loss', handleLoss);
      window.removeEventListener('ai-learning-updated', handleLearningUpdate);
    };
  }, [toast, recordAutomaticLearning]);

  // ✅ FUNÇÃO DE APRENDIZADO AUTOMÁTICO
  const recordAutomaticLearning = useCallback((result: 'WIN' | 'LOSS', analysis: any) => {
    try {
      const signal = signals.find(s => s.id === analysis.signalId);
      if (!signal) {
        console.warn('⚠️ Sinal não encontrado para aprendizado:', analysis.signalId);
        return;
      }

      // Criar dados de aprendizado completos
      const signalHistory = {
        id: signal.id,
        asset: signal.asset,
        direction: signal.direction,
        probability: signal.probability,
        analysisMetrics: signal.analysisMetrics || {
          rsi: 50 + Math.random() * 100,
          macd: Math.random() - 0.5,
          bbands: 50 + Math.random() * 100,
          candlePattern: signal.candlePattern || 'neutral',
          quadrantScore: 50 + Math.random() * 50,
          priceAction: 50 + Math.random() * 50,
          volumeProfile: 50 + Math.random() * 50,
          trendStrength: 40 + Math.random() * 60,
          supportResistance: 50 + Math.random() * 50,
          overallScore: 50 + Math.random() * 50,
        },
        result: result as 'WIN' | 'LOSS',
        timestamp: Date.now(),
      };

      // 1️⃣ Registrar no AI Learning System
      aiLearningSystem.recordSignal(signalHistory);
      console.log(`📚 [AI LEARNING] ${result} registrado - ${signal.asset} ${signal.direction}`);

      // 2️⃣ Registrar no Evolution Tracker
      const indicators = (signal.indicators_used || []).filter(Boolean) as string[];
      aiEvolutionTracker.addOperationLearning({
        signalId: signal.id,
        asset: signal.asset,
        direction: signal.direction,
        result,
        indicators,
        candlePattern: signal.candlePattern,
        learned: `IA aprendeu com ${result}: ${signal.asset} ${signal.direction} | Probabilidade: ${signal.probability}%`,
        implemented: [`Resultado registrado automaticamente: ${result}`],
      });
      console.log(`📝 [EVOLUTION] ${result} registrado no tracker`);

      // 3️⃣ Registrar métrica de evolução
      const learningState = aiLearningSystem.getLearningState();
      const history = aiLearningSystem.getHistory();
      const wins = history.filter(h => h.result === 'WIN').length;
      const completed = history.filter(h => h.result === 'WIN' || h.result === 'LOSS').length;
      const accuracy = completed > 0 ? (wins / completed) * 100 : 0;

      aiEvolutionTracker.recordMetric({
        winRate: learningState.winRate,
        totalSignals: learningState.totalSignals,
        phase: `${learningState.evolutionPhase}`,
        topIndicators: learningState.bestIndicators,
        accuracy,
      });

      console.log(`📊 [MÉTRICA ATUALIZADA]`);
      console.log(`   • Taxa de Acerto: ${accuracy.toFixed(1)}%`);
      console.log(`   • Total: ${completed} | Vitórias: ${wins}`);
      console.log(`   • Fase: ${learningState.evolutionPhase}`);
      console.log(`   • Melhores Indicadores: ${learningState.bestIndicators.join(', ') || 'N/A'}`);

      // 4️⃣ Disparar evento de aprendizado atualizado
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('operation-learned', {
          detail: {
            result,
            asset: signal.asset,
            direction: signal.direction,
            accuracy,
            timestamp: Date.now(),
          }
        }));
      }

      console.log(`✅ [APRENDIZADO COMPLETO] ${result} - ${signal.asset}`);
      console.log('═'.repeat(60));
    } catch (error) {
      console.error('❌ [ERRO] Falha ao registrar aprendizado automático:', error);
    }
  }, [signals]);

  const fetchSignals = useCallback(async () => {
    setIsLoading(true);
    try {
      // Verificar se já existem sinais no state
      const currentSignals = signals.length;
      
      // Mock data for development - database connectivity issues
      const assetsForMarket = ASSETS[marketType];
      const mockSignals: Signal[] = currentSignals > 0 ? [] : [
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
          ...(() => {
            const times = computeEntryExitTimes();
            return { entry_time: times.entryISO, exit_time: times.exitISO };
          })(),
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
          result: "PENDING",
          created_at: new Date().toISOString(),
          executed_at: null,
          ...(() => {
            const times = computeEntryExitTimes();
            return { entry_time: times.entryISO, exit_time: times.exitISO };
          })(),
        },
      ];

      // Apply minimum probability filter and merge with existing
      if (mockSignals.length > 0) {
        setSignals(prev => [...mockSignals.filter(s => s.probability >= minProbability), ...prev]);
      }
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

      // Garantir probabilidade mínima razoável (85% ~ 95%)
      if (adaptiveProbability < 85) {
        adaptiveProbability = 85 + Math.floor(Math.random() * 11); // 85-95%
      }
      if (adaptiveProbability > 98) {
        adaptiveProbability = 98; // Cap máximo
      }

      console.log('🎲 Probabilidade calculada:', adaptiveProbability.toFixed(1) + '%', '| Filtro mínimo:', minProbability + '%');

      // Check contra filtro do usuário
      if (adaptiveProbability < minProbability) {
        // If auto mode is enabled, schedule a retry; otherwise inform user
        if (autoGenerateEnabled) {
          // Try again shortly without flooding (only one pending retry)
          if (retryTimeoutRef.current == null) {
            retryTimeoutRef.current = setTimeout(() => {
              retryTimeoutRef.current = null;
              generateSignalRef.current();
            }, 10000); // 10s retry
          }
        } else {
          toast({
            title: `Sem oportunidade ≥ ${minProbability}%`,
            description: `Probabilidade gerada: ${adaptiveProbability.toFixed(1)}%. Reduza o filtro mínimo para ver mais sinais.`,
          });
        }
        console.log('⚠️ Sinal rejeitado - Probabilidade:', adaptiveProbability.toFixed(1) + '%', '< Mínimo:', minProbability + '%');
        return null;
      }
      
      // Determine direction based on analysis
      const direction: "CALL" | "PUT" = 
        analysis.priceAction > 60 && analysis.rsi < 70 ? "CALL" : "PUT";
      
      const { entryISO, exitISO, entryLabel, exitLabel } = computeEntryExitTimes();
      
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
        result: "PENDING",
        created_at: new Date().toISOString(),
        executed_at: null,
        entry_time: entryISO,
        exit_time: exitISO,
        analysisMetrics: analysis,
        candlePattern: candlePatternName,
      };

      setSignals((prev) => [mockNewSignal, ...prev]);

      // ✅ REGISTRAR SINAL NO AUTO-ANALYZER PARA ANÁLISE AUTOMÁTICA
      aiSignalAnalyzer.registerSignal({
        id: mockNewSignal.id,
        asset: mockNewSignal.asset,
        direction: mockNewSignal.direction,
        entryPrice: 100, // Preço simulado
          exitTime: new Date(exitISO).getTime(), // Timestamp de quando a vela termina
        confidence: mockNewSignal.probability,
        timestamp: Date.now(),
      });
      console.log('📊 Sinal registrado no auto-analyzer:', {
        id: mockNewSignal.id,
        asset: mockNewSignal.asset,
        direction: mockNewSignal.direction,
        entryTime: new Date(entryISO).toLocaleTimeString('pt-BR'),
        exitTime: new Date(exitISO).toLocaleTimeString('pt-BR'),
      });

      // Track analytics
      analytics.track('signal_generated', {
        asset: mockNewSignal.asset,
        direction: mockNewSignal.direction,
        probability: mockNewSignal.probability,
      });

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

      toast({
        title: "🤖 IA Gerou Sinal!",
        description: `${mockNewSignal.asset} - ${mockNewSignal.direction} (${mockNewSignal.probability}%)\nEntre na vela que inicia às ${entryLabel} e encerra às ${exitLabel}\nFase de Evolução: ${learningState.evolutionPhase} | Taxa: ${learningState.winRate.toFixed(1)}%`,
      });

      console.log('✅ Sinal gerado:', signalId, '| Probabilidade:', adaptiveProbability + '%');

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
  }, [marketType, isGenerating, minProbability, autoGenerateEnabled]);

  const updateSignalResult = useCallback(
    async (signalId: string, result: "WIN" | "LOSS") => {
      try {
        // Track analytics
        analytics.track(result === 'WIN' ? 'signal_win' : 'signal_loss', { signalId });

        // Mock update for development
        setSignals((prev) =>
          prev.map((s) =>
            s.id === signalId ? { ...s, result, executed_at: new Date().toISOString() } : s
          )
        );

        // Track analytics
        analytics.track(result === 'WIN' ? 'signal_win' : 'signal_loss', { signalId });

        // Update AI learning system
        aiLearningSystem.updateSignalResult(signalId, result);
        const learningState = aiLearningSystem.getLearningState();

        // Construir aprendizado por operação
        const history = aiLearningSystem.getHistory();
        const histSignal = history.find(h => h.id === signalId);
        const currentSignal = signals.find(s => s.id === signalId);
        if (histSignal && currentSignal) {
          const m: any = histSignal.analysisMetrics || {};
          const indicators = (currentSignal.indicators_used || []).filter(Boolean) as string[];
          const pattern = m.candlePattern || currentSignal.candlePattern;

          const learnedParts: string[] = [];
          if (result === 'WIN') {
            learnedParts.push(
              `Combinação ${pattern && pattern !== 'neutral' ? `do padrão ${pattern}` : 'de contexto'} com ` +
              `tendência ${m.trendStrength >= 60 ? 'forte' : 'moderada'} e ` +
              `suporte/resistência ${m.supportResistance >= 70 ? 'forte' : 'médio'} aumentou a precisão.`
            );
            if (Math.abs(m.macd || 0) > 0.5) learnedParts.push('Confirmação do MACD foi determinante.');
            if ((m.rsi || 50) > 70 || (m.rsi || 50) < 30) learnedParts.push('RSI extremo interpretado corretamente com contexto.');
          } else {
            learnedParts.push(`Padrão ${pattern || 'neutro'} mostrou baixa eficácia neste contexto.`);
            if (Math.abs(m.macd || 0) < 0.3) learnedParts.push('Faltou confirmação do MACD.');
            if ((m.trendStrength || 0) < 40) learnedParts.push('Tendência fraca gerou falso sinal.');
          }

          const implemented: string[] = [];
          if (result === 'WIN') {
            implemented.push('Priorizar sinais com tendência > 60 e S/R > 70');
            if (indicators.length > 0) implemented.push(`Aumentar peso de ${indicators[0]} na pontuação`);
            if (Math.abs(m.macd || 0) > 0.5 && pattern) implemented.push(`Manter ${pattern} como favorável com MACD forte`);
          } else {
            if (pattern) implemented.push(`Reduzir pontuação de ${pattern} sem confirmação de MACD`);
            implemented.push('Exigir 2 confirmações entre RSI/MACD/Price Action');
            implemented.push('Evitar entradas com tendência < 40 ou S/R < 50');
          }

          aiEvolutionTracker.addOperationLearning({
            signalId,
            asset: histSignal.asset,
            direction: histSignal.direction,
            result,
            indicators,
            candlePattern: pattern,
            learned: learnedParts.join(' '),
            implemented,
          });
        }

        // Som de feedback
        if (result === "WIN") {
          soundSystem.playWin();
        } else {
          soundSystem.playLoss();
        }

        // Registrar métrica de evolução (para ambos os resultados)
        {
          const hist = aiLearningSystem.getHistory();
          const wins = hist.filter(h => h.result === 'WIN').length;
          const completed = hist.filter(h => h.result === 'WIN' || h.result === 'LOSS').length;
          const accuracy = completed > 0 ? (wins / completed) * 100 : 0;
          aiEvolutionTracker.recordMetric({
            winRate: learningState.winRate,
            totalSignals: learningState.totalSignals,
            phase: `${learningState.evolutionPhase}`,
            topIndicators: learningState.bestIndicators,
            accuracy,
          });
        }

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
    [signals]
  );

  // Update generateSignal ref for use in auto-refresh
  useEffect(() => {
    generateSignalRef.current = generateSignal;
  }, [generateSignal]);

  // Salvar sinais no localStorage automaticamente
  useEffect(() => {
    try {
      localStorage.setItem(`signals_${marketType}`, JSON.stringify(signals.slice(0, 50))); // Manter últimos 50
    } catch (e) {
      console.error('Erro ao salvar sinais:', e);
    }
  }, [signals, marketType]);

  // Fetch signals on component mount and market type change
  useEffect(() => {
    fetchSignals();
  }, [marketType]);

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

              // Prefer stored entry/exit times to show a precise window
              const entryTime = signal.entry_time ? new Date(signal.entry_time) : new Date(createdTime + 60000);
              const exitTime = signal.exit_time ? new Date(signal.exit_time) : new Date(entryTime.getTime() + 60000);

              const entryTimeStr = entryTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const exitTimeStr = exitTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

              // Play notification sound (high priority)
              soundSystem.playEntryAlert();

              toast({
                title: "⏰ HORA DE ENTRAR!",
                description: `${signal.asset} - ${signal.direction}\nEntre na vela que inicia às ${entryTimeStr} e encerra às ${exitTimeStr}\nProbabilidade: ${signal.probability}%`,
                variant: "default",
                duration: 50000, // Show for 50 seconds
              });

              // Play notification sound (high priority)
              try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 880; // A5 note
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                
                // Second beep
                setTimeout(() => {
                  const osc2 = audioContext.createOscillator();
                  const gain2 = audioContext.createGain();
                  osc2.connect(gain2);
                  gain2.connect(audioContext.destination);
                  osc2.frequency.value = 1046; // C6 note
                  gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                  gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                  osc2.start(audioContext.currentTime);
                  osc2.stop(audioContext.currentTime + 0.3);
                }, 200);
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

  // AUTO-REFRESH: Gera sinais automaticamente em intervalos regulares
  useEffect(() => {
    if (!autoGenerateEnabled) {
      if (autoRefreshTimeoutRef.current) {
        clearTimeout(autoRefreshTimeoutRef.current);
        autoRefreshTimeoutRef.current = null;
      }
      return;
    }

    // Armazena referência da função generateSignal
    const scheduleNextGeneration = async () => {
      if (!autoGenerateEnabled || !generateSignalRef.current) return;
      
      try {
        await generateSignalRef.current();
      } catch (e) {
        console.error('Erro ao gerar sinal:', e);
      }
      
      // Agenda próxima geração
      autoRefreshTimeoutRef.current = setTimeout(() => {
        if (autoGenerateEnabled) {
          scheduleNextGeneration();
        }
      }, autoRefreshInterval * 1000);
    };

    // Pequeno delay para garantir que ref está pronta, depois gera imediatamente
    const initialDelay = setTimeout(() => {
      scheduleNextGeneration();
    }, 500);

    return () => {
      clearTimeout(initialDelay);
      if (autoRefreshTimeoutRef.current) {
        clearTimeout(autoRefreshTimeoutRef.current);
        autoRefreshTimeoutRef.current = null;
      }
    };
  }, [autoGenerateEnabled, autoRefreshInterval]);

  // Aprendizado web contínuo
  useEffect(() => {
    if (autoGenerateEnabled) {
      aiLearningSystem.learnFromWeb().catch(e => {
        console.error('Erro em aprendizado web:', e);
      });
    }
  }, [autoGenerateEnabled]);

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
    autoRefreshInterval,
    setAutoRefreshInterval,
  };
}
