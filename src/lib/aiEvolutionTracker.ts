/**
 * Sistema de rastreamento e evolução da IA
 * Armazena histórico e permite feedback do usuário
 */

export interface EvolutionMetric {
  timestamp: number;
  winRate: number;
  totalSignals: number;
  phase: string;
  topIndicators: string[];
  accuracy: number;
}

export interface UserFeedback {
  id: string;
  timestamp: number;
  type: 'improvement' | 'suggestion' | 'bug';
  content: string;
  relatedMetrics?: string[];
  status?: 'applied' | 'rejected' | 'queued';
  aiResponse?: string;
  appliedChanges?: string[];
}

export interface OperationLearning {
  id: string;
  timestamp: number;
  signalId: string;
  asset: string;
  direction: 'CALL' | 'PUT';
  result: 'WIN' | 'LOSS';
  indicators: string[];
  candlePattern?: string;
  learned: string;
  implemented: string[];
}

import { aiLearningSystem } from './aiLearning';
import { supabase } from '@/integrations/supabase/client';

class AIEvolutionTracker {
  private metrics: EvolutionMetric[] = [];
  private feedback: UserFeedback[] = [];
  private operationLearnings: OperationLearning[] = [];
  private readonly MAX_METRICS = 288; // 4 horas com métricas a cada 50 segundos
  private readonly MAX_FEEDBACK = 100;
  private readonly MAX_OPERATION_LEARNINGS = 200;

  constructor() {
    this.loadFromStorage();
  }

  recordMetric(metric: Omit<EvolutionMetric, 'timestamp'>) {
    const fullMetric: EvolutionMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    this.saveToStorage();

    // Persistir métricas de evolução no Supabase (best-effort)
    try {
      const supa: any = supabase as any;
      void supa.from('ai_evolution_metrics').insert({
        timestamp: new Date(fullMetric.timestamp).toISOString(),
        win_rate: fullMetric.winRate,
        total_signals: fullMetric.totalSignals,
        phase: fullMetric.phase,
        top_indicators: JSON.stringify(fullMetric.topIndicators || []),
        accuracy: fullMetric.accuracy,
      });
    } catch {}
  }

  addFeedback(type: UserFeedback['type'], content: string, relatedMetrics?: string[]) {
    const feedback: UserFeedback = {
      id: `feedback-${Date.now()}`,
      timestamp: Date.now(),
      type,
      content,
      relatedMetrics,
    };

    this.feedback.push(feedback);
    if (this.feedback.length > this.MAX_FEEDBACK) {
      this.feedback = this.feedback.slice(-this.MAX_FEEDBACK);
    }

    // Processar automaticamente feedbacks de melhoria/sugestão
    if (type === 'improvement' || type === 'suggestion') {
      const result = aiLearningSystem.applyOperationalSuggestion(content);
      feedback.status = result.applied ? 'applied' : 'queued';
      feedback.aiResponse = result.response;
      feedback.appliedChanges = result.changes;
    } else {
      feedback.status = 'queued';
      feedback.aiResponse = '🐛 Bug registrado. Será analisado e corrigido quando possível.';
    }

    this.saveToStorage();

    // Persistir no Supabase (best-effort)
    try {
      const payload: any = {
        id: feedback.id,
        timestamp: new Date(feedback.timestamp).toISOString(),
        type: feedback.type,
        content: feedback.content,
        related_metrics: relatedMetrics ? JSON.stringify(relatedMetrics) : null,
        status: feedback.status,
        ai_response: feedback.aiResponse,
        applied_changes: feedback.appliedChanges ? JSON.stringify(feedback.appliedChanges) : null,
      };
      const supa: any = supabase as any;
      void supa.from('ai_feedback').insert(payload);
    } catch {}
    return feedback;
  }

  addOperationLearning(entry: Omit<OperationLearning, 'id' | 'timestamp'>) {
    const full: OperationLearning = {
      id: `learning-${entry.signalId}-${Date.now()}`,
      timestamp: Date.now(),
      ...entry,
    };

    this.operationLearnings.push(full);
    if (this.operationLearnings.length > this.MAX_OPERATION_LEARNINGS) {
      this.operationLearnings = this.operationLearnings.slice(-this.MAX_OPERATION_LEARNINGS);
    }

    this.saveToStorage();

    // Persistir no Supabase (best-effort)
    try {
      const payload: any = {
        id: full.id,
        timestamp: new Date(full.timestamp).toISOString(),
        signal_id: full.signalId,
        asset: full.asset,
        direction: full.direction,
        result: full.result,
        indicators: full.indicators,
        candle_pattern: full.candlePattern || null,
        learned: full.learned,
        implemented: full.implemented,
      };
      const supa: any = supabase as any;
      void supa.from('ai_operation_learnings').insert(payload);
    } catch {}
    return full;
  }

  getMetrics(hours: number = 4): EvolutionMetric[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  getFeedback(limit: number = 20): UserFeedback[] {
    return this.feedback.slice(-limit);
  }

  getOperationLearnings(limit: number = 50): OperationLearning[] {
    return this.operationLearnings.slice(-limit);
  }

  getEvolutionStats() {
    const recentMetrics = this.getMetrics(1); // Última hora
    if (recentMetrics.length === 0) {
      return null;
    }

    const latest = recentMetrics[recentMetrics.length - 1];
    const oldest = recentMetrics[0];

    return {
      currentWinRate: latest.winRate,
      previousWinRate: oldest.winRate,
      winRateDelta: latest.winRate - oldest.winRate,
      currentPhase: latest.phase,
      totalSignalsLastHour: recentMetrics.reduce((sum, m) => sum + m.totalSignals, 0),
      averageAccuracy: (recentMetrics.reduce((sum, m) => sum + m.accuracy, 0) / recentMetrics.length) * 100,
      topIndicators: latest.topIndicators,
      feedbackCount: this.feedback.length,
    };
  }

  getMetricsForChart(): Array<{ time: string; winRate: number; accuracy: number }> {
    return this.metrics.map(m => ({
      time: new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      winRate: m.winRate,
      accuracy: m.accuracy,
    }));
  }

  private saveToStorage() {
    try {
      localStorage.setItem('ai_metrics', JSON.stringify(this.metrics.slice(-100)));
      localStorage.setItem('ai_feedback', JSON.stringify(this.feedback.slice(-50)));
      localStorage.setItem('ai_operation_learnings', JSON.stringify(this.operationLearnings.slice(-100)));
    } catch (e) {
      console.warn('Erro ao salvar evolução da IA:', e);
    }
  }

  private loadFromStorage() {
    try {
      const savedMetrics = localStorage.getItem('ai_metrics');
      const savedFeedback = localStorage.getItem('ai_feedback');
      const savedLearnings = localStorage.getItem('ai_operation_learnings');

      if (savedMetrics) {
        this.metrics = JSON.parse(savedMetrics);
      }
      if (savedFeedback) {
        this.feedback = JSON.parse(savedFeedback);
      }
      if (savedLearnings) {
        this.operationLearnings = JSON.parse(savedLearnings);
      }
    } catch (e) {
      console.warn('Erro ao carregar evolução da IA:', e);
    }
  }

  clear() {
    this.metrics = [];
    this.feedback = [];
    this.operationLearnings = [];
    localStorage.removeItem('ai_metrics');
    localStorage.removeItem('ai_feedback');
    localStorage.removeItem('ai_operation_learnings');
  }
}

export const aiEvolutionTracker = new AIEvolutionTracker();
