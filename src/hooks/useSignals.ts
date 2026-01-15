import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { performComprehensiveAnalysis } from "@/lib/technicalAnalysis";
import { aiLearningSystem, type SignalHistory } from "@/lib/aiLearning";
import { performAdvancedCandleAnalysis } from "@/lib/advancedCandleAnalysis";
import { advancedCandleAnalyzer, type CandleData } from "@/lib/advancedCandlePatternAnalyzer";
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
      const loadedSignals = saved ? JSON.parse(saved) : [];
      console.log(`📦 Sinais carregados do localStorage para ${marketType}:`, loadedSignals.length);
      // Filtrar apenas sinais do mercado correto
      const filteredSignals = loadedSignals.filter((s: Signal) => s.market_type === marketType);
      console.log(`✅ Sinais após filtro de mercado (${marketType}):`, filteredSignals.length);
      return filteredSignals;
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(autoGenerate);
  const [minProbability, setMinProbability] = useState<number>(50); // Reduzido de 85% para 50% para permitir aprendizado adaptativo
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // 30 segundos - geração mais rápida
  const { toast } = useToast();
  
  // ✅ REFS PARA CONTROLE DE AUTO-GERAÇÃO E TIMEOUTS
  const generateSignalRef = useRef<(() => Promise<void>) | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug log
  useEffect(() => {
    console.log('🤖 Auto-geração:', autoGenerateEnabled ? 'ATIVA' : 'INATIVA', '| Intervalo:', autoRefreshInterval + 's');
  }, [autoGenerateEnabled, autoRefreshInterval]);

  // ✅ LISTENER PARA ANÁLISE AUTOMÁTICA DE SINAIS
  useEffect(() => {
    // Quando um sinal é analisado e marcado como WIN/LOSS, registrar aprendizado automático
    const handleSignalWin = (analysis: any) => {
      const signalId = analysis.signalId;
      console.log(`🎉 SINAL GANHOU AUTOMATICAMENTE: ${signalId}`, analysis);
      
      // Atualizar estado local
      setSignals(prev =>
        prev.map(s =>
          s.id === signalId ? { ...s, result: 'WIN', executed_at: new Date().toISOString() } : s
        )
      );
      
      // Registrar no sistema de aprendizado IMEDIATAMENTE
      recordAutomaticLearning('WIN', analysis);
      
      soundSystem.playWin();
      toast({
        title: "✅ Vitória Registrada!",
        description: `${analysis.asset} ${analysis.direction} - Ganhou automaticamente`,
      });
    };

    const handleSignalLoss = (analysis: any) => {
      const signalId = analysis.signalId;
      console.log(`❌ SINAL PERDEU AUTOMATICAMENTE: ${signalId}`, analysis);
      
      // Atualizar estado local
      setSignals(prev =>
        prev.map(s =>
          s.id === signalId ? { ...s, result: 'LOSS', executed_at: new Date().toISOString() } : s
        )
      );
      
      // Registrar no sistema de aprendizado IMEDIATAMENTE
      recordAutomaticLearning('LOSS', analysis);
      
      soundSystem.playLoss();
      toast({
        title: "❌ Derrota Registrada!",
        description: `${analysis.asset} ${analysis.direction} - Perdeu automaticamente`,
        variant: "destructive",
      });
    };

    // Registrar listeners no analisador
    aiSignalAnalyzer.onWin(handleSignalWin);
    aiSignalAnalyzer.onLoss(handleSignalLoss);

    return () => {
      // Cleanup (optional - o analyzer mantém referências, então não precisa desregistrar)
    };
  }, []);

  // ✅ FUNÇÃO DE APRENDIZADO AUTOMÁTICO
  const recordAutomaticLearning = useCallback((result: 'WIN' | 'LOSS', analysis: any) => {
    try {
      const signal = signals.find(s => s.id === analysis.signalId);
      if (!signal) {
        console.warn('⚠️ Sinal não encontrado para aprendizado:', analysis.signalId);
        return;
      }

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

      aiLearningSystem.recordSignal(signalHistory);
      console.log(`📚 [AI LEARNING] ${result} registrado - ${signal.asset} ${signal.direction}`);

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
    console.log(`\n🎰 === GERANDO NOVO SINAL ===`);
    console.log(`📍 Mercado selecionado: ${marketType}`);
    
    try {
      // Random asset selection
      const assetsForMarket = ASSETS[marketType];
      console.log(`📦 Assets disponíveis para ${marketType}:`, assetsForMarket);
      const asset = assetsForMarket[Math.floor(Math.random() * assetsForMarket.length)];
      console.log(`🎯 Asset escolhido: ${asset}`);
      
      // Simulate price data for analysis
      const mockPrices = Array.from({ length: 50 }, () => 
        100 + (Math.random() - 0.5) * 10
      );
      
      // 🔥 GERAR DADOS DE VELAS PARA ANÁLISE AVANÇADA
      const candleData: CandleData = {
        open: mockPrices[mockPrices.length - 2],
        high: Math.max(...mockPrices.slice(-5)),
        low: Math.min(...mockPrices.slice(-5)),
        close: mockPrices[mockPrices.length - 1],
        volume: Math.floor(Math.random() * 1000000),
        timestamp: Date.now(),
      };
      
      // 🎯 ANÁLISE AVANÇADA DE PADRÕES DE VELAS
      const advancedAnalysis = advancedCandleAnalyzer.analyzeCandle(asset, candleData);
      
      console.log('\n🔬 === ANÁLISE AVANÇADA DE VELAS ===');
      console.log(`📊 Asset: ${asset}`);
      console.log(`🎨 Cor: ${advancedAnalysis.colorPattern.color} | Intensidade: ${advancedAnalysis.colorPattern.intensity.toFixed(0)}%`);
      console.log(`📐 Sequência: ${advancedAnalysis.colorPattern.sequence}`);
      console.log(`🎲 Quadrantes: O:${advancedAnalysis.quadrantAnalysis.openQuadrant} C:${advancedAnalysis.quadrantAnalysis.closeQuadrant} | Posição: ${advancedAnalysis.quadrantAnalysis.bodyPosition}`);
      console.log(`🎯 PREVISÃO: ${advancedAnalysis.prediction.predictedDirection} (${advancedAnalysis.prediction.confidence.toFixed(1)}%)`);
      console.log(`📈 Precisão Histórica: ${advancedAnalysis.prediction.historicalAccuracy.toFixed(1)}%`);
      console.log(`💡 Razões:`, advancedAnalysis.prediction.reasoning);
      console.log(`🏷️  Padrões: ${advancedAnalysis.prediction.basedOnPatterns.join(', ')}`);
      console.log(`⚡ Score Final: ${advancedAnalysis.score.toFixed(1)}/100`);
      
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

      // 🔥 INTEGRAR ANÁLISE AVANÇADA DE VELAS NA PROBABILIDADE
      // Usa a previsão do analisador avançado como fator adicional
      console.log('\n🎯 === INTEGRANDO ANÁLISE AVANÇADA ===');
      
      // Ajusta probabilidade baseado na confiança da previsão
      const predictionBonus = (advancedAnalysis.prediction.confidence - 50) * 0.3; // 30% do peso
      const historicalBonus = (advancedAnalysis.prediction.historicalAccuracy - 50) * 0.2; // 20% do peso
      const scoreBonus = (advancedAnalysis.score - 50) * 0.25; // 25% do peso
      
      console.log(`📈 Bonus de Previsão: ${predictionBonus > 0 ? '+' : ''}${predictionBonus.toFixed(1)}`);
      console.log(`📊 Bonus Histórico: ${historicalBonus > 0 ? '+' : ''}${historicalBonus.toFixed(1)}`);
      console.log(`⚡ Bonus de Score: ${scoreBonus > 0 ? '+' : ''}${scoreBonus.toFixed(1)}`);
      
      adaptiveProbability += predictionBonus + historicalBonus + scoreBonus;
      
      // Bonus adicional se múltiplos padrões concordam
      if (advancedAnalysis.prediction.basedOnPatterns.length >= 3) {
        adaptiveProbability += 5;
        console.log(`🎁 Bonus por ${advancedAnalysis.prediction.basedOnPatterns.length} padrões: +5`);
      }
      
      // Determina direção baseada na previsão avançada
      const predictedDirection: "CALL" | "PUT" = 
        advancedAnalysis.prediction.predictedDirection === 'UP' ? "CALL" : "PUT";
      
      console.log(`🎲 Direção Prevista: ${predictedDirection} (baseado em análise avançada)`);
      console.log(`✨ Probabilidade após análise avançada: ${adaptiveProbability.toFixed(1)}%`);
      console.log('='.repeat(50));

      // ✅ APLICAR PENALIZAÇÕES/BÔNUS BASEADOS NO APRENDIZADO - MUITO MAIS AGRESSIVO AGORA
      const operationalConfig = aiLearningSystem.getOperationalConfig();
      const patternRates = aiLearningSystem.getLearningState().patternSuccessRates;
      
      // Se o padrão tem histórico, ajustar probabilidade COM MUITO MAIS FORÇA
      if (patternRates[candlePatternName]) {
        const patternSuccessRate = patternRates[candlePatternName];
        if (patternSuccessRate < 35) {
          // Padrão MUITO fraco = REJEITAR DRASTICAMENTE
          adaptiveProbability -= 45;
          console.log(`🔴 PADRÃO MUITO FRACO: ${candlePatternName} (${patternSuccessRate.toFixed(1)}%) - REJEITANDO!`);
        } else if (patternSuccessRate < 45) {
          // Padrão fraco = Penalizar bastante
          adaptiveProbability -= 30;
          console.log(`⚠️ Padrão fraco: ${candlePatternName} (${patternSuccessRate.toFixed(1)}%) - Penalização forte`);
        } else if (patternSuccessRate > 75) {
          // Padrão MUITO forte = BOOST FORTE
          adaptiveProbability += 25;
          console.log(`✅ PADRÃO MUITO FORTE: ${candlePatternName} (${patternSuccessRate.toFixed(1)}%) - BOOST MÁXIMO!`);
        } else if (patternSuccessRate > 65) {
          // Padrão bom = boost moderado
          adaptiveProbability += 15;
          console.log(`✅ Padrão bom: ${candlePatternName} (${patternSuccessRate.toFixed(1)}%) - Boost moderado`);
        }
      }

      // Verificar requisitos mínimos aprendidos - MUITO MAIS RIGOROSO
      if (analysis.trendStrength < operationalConfig.minTrendStrength) {
        adaptiveProbability -= 25; // Aumentado de 10 para 25
        console.log(`🔴 Trend Strength ${analysis.trendStrength.toFixed(1)} abaixo do mínimo ${operationalConfig.minTrendStrength} - PENALIZAÇÃO SEVERA`);
      }
      
      if (analysis.supportResistance < operationalConfig.minSupportResistance) {
        adaptiveProbability -= 25; // Aumentado de 10 para 25
        console.log(`🔴 S/R ${analysis.supportResistance.toFixed(1)} abaixo do mínimo ${operationalConfig.minSupportResistance} - PENALIZAÇÃO SEVERA`);
      }

      // Aplicar taxa de acerto histórica COM MUITO MAIS PESO
      const winRate = learningState.winRate;
      if (winRate > 0) {
        if (winRate < 30) {
          // CRÍTICO - perdendo MUITO
          adaptiveProbability -= 40;
          console.log(`🚨 CRÍTICO: Win Rate ${winRate.toFixed(1)}% - Sendo MUITO conservador`);
        } else if (winRate < 40) {
          // Muito ruim
          adaptiveProbability -= 30;
          console.log(`🔴 Win Rate muito baixo (${winRate.toFixed(1)}%) - Penalização severa`);
        } else if (winRate < 50) {
          // Ruim
          adaptiveProbability -= 20;
          console.log(`⚠️ Win Rate baixo (${winRate.toFixed(1)}%) - Sendo conservador`);
        } else if (winRate > 80) {
          // Excelente!
          adaptiveProbability += 15;
          console.log(`🚀 Win Rate excelente (${winRate.toFixed(1)}%) - Confiança máxima!`);
        } else if (winRate > 70) {
          // Muito bom
          adaptiveProbability += 10;
          console.log(`📈 Win Rate alto (${winRate.toFixed(1)}%) - Confiança aumentada`);
        } else if (winRate > 60) {
          // Bom
          adaptiveProbability += 5;
          console.log(`📈 Win Rate positivo (${winRate.toFixed(1)}%) - Ligeira confiança`);
        }
      }

      // 🎯 LIMITE MÍNIMO MUITO MAIS ALTO AGORA - A IA PRECISA APRENDER A SER SELETIVA
      // Se está perdendo, ainda mais seletivo
      const minThreshold = winRate < 50 ? 65 : 58; // Muito mais rigoroso quando perdendo
      adaptiveProbability = Math.min(98, Math.max(minThreshold, Math.round(adaptiveProbability)));

      console.log('🎲 Probabilidade final após aprendizado:', adaptiveProbability.toFixed(1) + '%', '| Filtro mínimo:', minProbability + '%', '| Min threshold:', minThreshold);

      // Check contra filtro do usuário
      if (adaptiveProbability < minProbability) {
        console.log('❌❌❌ SINAL REJEITADO ❌❌❌');
        console.log('   Probabilidade calculada:', adaptiveProbability.toFixed(1) + '%');
        console.log('   Filtro mínimo configurado:', minProbability + '%');
        console.log('   Threshold mínimo da IA:', minThreshold + '%');
        console.log('   Para ver sinais, a IA precisa melhorar ou reduza o filtro mínimo na interface');
        
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
        return null;
      }
      
      console.log('✅✅✅ SINAL APROVADO ✅✅✅');
      console.log('   Probabilidade:', adaptiveProbability.toFixed(1) + '%');
      console.log('   Padrão:', candlePatternName);
      console.log('   Direção:', predictedDirection);
      console.log('   Baseado em:', advancedAnalysis.prediction.basedOnPatterns.join(', '));
      
      const { entryISO, exitISO, entryLabel, exitLabel } = computeEntryExitTimes();
      
      const signalId = `mock-${Date.now()}`;
      const mockNewSignal: Signal = {
        id: signalId,
        asset: asset, // Usa o asset selecionado
        direction: predictedDirection, // Usa a direção prevista
        probability: adaptiveProbability,
        market_type: marketType,
        expiration_time: 60, // Always 60 seconds (1 minute candle)
        indicators_used: [...bestIndicators, 'Quadrant Analysis', 'Color Patterns'],
        ai_reasoning: `${generateAIReasoning(analysis, learningState)} | ${advancedAnalysis.prediction.reasoning[0] || 'Análise avançada'}`,
        result: "PENDING",
        created_at: new Date().toISOString(),
        executed_at: null,
        entry_time: entryISO,
        exit_time: exitISO,
        analysisMetrics: {
          ...analysis,
          // Adiciona métricas avançadas
          advancedScore: advancedAnalysis.score,
          predictionConfidence: advancedAnalysis.prediction.confidence,
          colorSequence: advancedAnalysis.colorPattern.sequence,
          quadrants: `${advancedAnalysis.quadrantAnalysis.openQuadrant}→${advancedAnalysis.quadrantAnalysis.closeQuadrant}`,
        },
        candlePattern: `${candlePatternName} | ${advancedAnalysis.colorPattern.sequence}`,
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

        // 🔥 REGISTRAR RESULTADO NO ANALISADOR AVANÇADO
        const currentSignal = signals.find(s => s.id === signalId);
        if (currentSignal && currentSignal.analysisMetrics) {
          const candleData: CandleData = {
            open: 100,
            high: 102,
            low: 98,
            close: result === 'WIN' ? 
              (currentSignal.direction === 'CALL' ? 101 : 99) :
              (currentSignal.direction === 'CALL' ? 99 : 101),
            volume: Math.floor(Math.random() * 1000000),
            timestamp: Date.now(),
          };
          
          // Registra no analisador avançado para aprender com o resultado
          advancedCandleAnalyzer.analyzeCandle(currentSignal.asset, candleData, result);
          
          console.log(`🎯 Resultado registrado no analisador avançado: ${result}`);
        }

        // Construir aprendizado por operação
        const history = aiLearningSystem.getHistory();
        const histSignal = history.find(h => h.id === signalId);
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
    console.log(`🔄 Mercado alterado para: ${marketType}`);
    console.log(`📦 Assets disponíveis:`, ASSETS[marketType]);
    console.log(`📊 Sinais atuais no state:`, signals.length);
    console.log(`🎯 Sinais do mercado ${marketType}:`, signals.filter(s => s.market_type === marketType).length);
    
    // Limpar sinais de outro mercado
    setSignals(prev => prev.filter(s => s.market_type === marketType));
    
    fetchSignals();
    
    // Gerar um sinal IMEDIATAMENTE ao trocar de mercado
    console.log(`⚡ GERANDO SINAL IMEDIATAMENTE para ${marketType}...`);
    const immediateGeneration = setTimeout(() => {
      if (generateSignalRef.current) {
        console.log(`🎲 Executando geração de sinal para ${marketType}...`);
        generateSignalRef.current().then(() => {
          console.log(`✅ Sinal gerado com sucesso para ${marketType}`);
        }).catch((err) => {
          console.error(`❌ Erro ao gerar sinal para ${marketType}:`, err);
        });
      } else {
        console.error(`❌ generateSignalRef.current não está definido!`);
      }
    }, 500);

    return () => clearTimeout(immediateGeneration);
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
