// 🤖 SISTEMA DE APRENDIZADO AUTOMÁTICO CONTÍNUO
// Roda em background, busca conhecimento na web e evolui estratégias constantemente

import { aiLearningSystem } from './aiLearning';
import { webResearchSystem } from './webResearch';
import { evolutionEngine } from './evolutionEngine';

class AutomaticLearningSystem {
  private isRunning = false;
  private learningInterval: NodeJS.Timeout | null = null;
  private researchInterval: NodeJS.Timeout | null = null;
  private evolutionCheckInterval: NodeJS.Timeout | null = null;
  
  // Configurações
  private readonly LEARNING_INTERVAL = 5 * 60 * 1000; // 5 minutos
  private readonly RESEARCH_INTERVAL = 15 * 60 * 1000; // 15 minutos
  private readonly EVOLUTION_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutos

  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Sistema de aprendizado automático já está rodando');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Sistema de Aprendizado Automático INICIADO');
    console.log(`   📚 Aprendizado a cada ${this.LEARNING_INTERVAL / 1000}s`);
    console.log(`   🌐 Pesquisa web a cada ${this.RESEARCH_INTERVAL / 1000}s`);
    console.log(`   🧬 Verificação evolutiva a cada ${this.EVOLUTION_CHECK_INTERVAL / 1000}s`);

    // Executa imediatamente
    this.runLearningCycle();
    this.runResearchCycle();
    this.runEvolutionCheck();

    // Programa ciclos regulares
    this.learningInterval = setInterval(() => this.runLearningCycle(), this.LEARNING_INTERVAL);
    this.researchInterval = setInterval(() => this.runResearchCycle(), this.RESEARCH_INTERVAL);
    this.evolutionCheckInterval = setInterval(() => this.runEvolutionCheck(), this.EVOLUTION_CHECK_INTERVAL);
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.learningInterval) clearInterval(this.learningInterval);
    if (this.researchInterval) clearInterval(this.researchInterval);
    if (this.evolutionCheckInterval) clearInterval(this.evolutionCheckInterval);

    console.log('🛑 Sistema de Aprendizado Automático PARADO');
  }

  // Ciclo de aprendizado com sinais históricos
  private async runLearningCycle(): Promise<void> {
    try {
      console.log('📚 [Ciclo de Aprendizado] Analisando histórico...');
      
      const history = aiLearningSystem.getHistory();
      const recentSignals = history.slice(-20);
      
      if (recentSignals.length === 0) {
        console.log('   ℹ️ Nenhum sinal no histórico ainda');
        return;
      }

      // Analisa padrões de vitória
      const wins = recentSignals.filter(s => s.result === 'WIN');
      const losses = recentSignals.filter(s => s.result === 'LOSS');
      
      console.log(`   📊 Últimos 20 sinais: ${wins.length}W - ${losses.length}L`);

      // Identifica padrões vencedores
      if (wins.length > 0) {
        const winningPatterns = wins.reduce((acc, signal) => {
          const pattern = signal.analysisMetrics.candlePattern;
          acc[pattern] = (acc[pattern] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        console.log('   ✅ Padrões vencedores:', winningPatterns);

        // Reforça padrões vencedores
        Object.entries(winningPatterns).forEach(([pattern, count]) => {
          if (count >= 3) {
            aiLearningSystem.reinforcePattern(pattern, 1.15);
            console.log(`   🔥 Reforçado: ${pattern} (${count} vitórias)`);
          }
        });
      }

      // Identifica padrões perdedores
      if (losses.length > 0) {
        const losingPatterns = losses.reduce((acc, signal) => {
          const pattern = signal.analysisMetrics.candlePattern;
          acc[pattern] = (acc[pattern] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        console.log('   ❌ Padrões perdedores:', losingPatterns);

        // Penaliza padrões perdedores
        Object.entries(losingPatterns).forEach(([pattern, count]) => {
          if (count >= 2) {
            aiLearningSystem.penalizePattern(pattern, 0.75);
            console.log(`   🔴 Penalizado: ${pattern} (${count} perdas)`);
          }
        });
      }

      // Busca aprendizado web sobre fraquezas
      if (losses.length >= 3) {
        console.log('   🌐 Detectadas múltiplas perdas, buscando conhecimento...');
        await aiLearningSystem.learnFromWeb();
      }

      console.log('   ✅ Ciclo de aprendizado concluído');
    } catch (error) {
      console.error('   ❌ Erro no ciclo de aprendizado:', error);
    }
  }

  // Ciclo de pesquisa web
  private async runResearchCycle(): Promise<void> {
    try {
      console.log('🌐 [Ciclo de Pesquisa] Buscando conhecimento na web...');
      
      const stats = evolutionEngine.getEvolutionStats();
      
      // Tópicos para pesquisar baseados no estado atual
      const topics: string[] = [];
      
      if (stats.consecutiveWins === 0) {
        topics.push('winning trading strategies');
        topics.push('technical analysis patterns');
        console.log('   🎯 Foco: Melhorar estratégias após perdas');
      } else if (stats.consecutiveWins >= 5) {
        topics.push('maintaining winning streak');
        topics.push('risk management');
        console.log('   🔥 Foco: Manter sequência de vitórias');
      } else {
        topics.push('candlestick patterns');
        topics.push('market indicators');
        console.log('   📈 Foco: Aprimoramento geral');
      }

      // Pesquisa cada tópico
      for (const topic of topics) {
        console.log(`   🔍 Pesquisando: ${topic}`);
        const knowledge = await webResearchSystem.searchKnowledge(topic);
        console.log(`   📚 Obtidos ${knowledge.insights.length} insights (${(knowledge.confidence * 100).toFixed(0)}% confiança)`);
        
        // Log de alguns insights
        knowledge.insights.slice(0, 3).forEach(insight => {
          console.log(`      💡 ${insight}`);
        });

        // Aguarda um pouco entre pesquisas
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('   ✅ Ciclo de pesquisa concluído');
    } catch (error) {
      console.error('   ❌ Erro no ciclo de pesquisa:', error);
    }
  }

  // Verificação e evolução de estratégias
  private runEvolutionCheck(): void {
    try {
      console.log('🧬 [Verificação Evolutiva] Analisando estratégias...');
      
      const stats = evolutionEngine.getEvolutionStats();
      const strategies = evolutionEngine.getAllStrategies();
      
      console.log(`   📊 Geração ${stats.generation}: ${strategies.length} estratégias`);
      console.log(`   🎯 Progresso: ${stats.consecutiveWins}/${stats.targetWins} vitórias`);
      console.log(`   🏆 Melhor: ${stats.bestStrategy.name} (${stats.bestStrategy.winRate.toFixed(1)}% WR)`);

      // Verifica se alguma estratégia precisa evoluir
      const needsEvolution = strategies.some(s => {
        const total = s.performance.wins + s.performance.losses;
        return total >= 10 && s.performance.winRate < 45; // Baixa performance
      });

      if (needsEvolution) {
        console.log('   🧬 Estratégias com baixa performance detectadas');
        console.log('   🔄 Evolução será processada no próximo ciclo de resultados');
      }

      // Avisa se estamos próximos do objetivo
      if (stats.consecutiveWins >= 10) {
        console.log(`   🔥🔥🔥 PRÓXIMO DO OBJETIVO! ${stats.consecutiveWins} vitórias consecutivas!`);
      }

      console.log('   ✅ Verificação evolutiva concluída');
    } catch (error) {
      console.error('   ❌ Erro na verificação evolutiva:', error);
    }
  }

  // Status do sistema
  getStatus() {
    return {
      isRunning: this.isRunning,
      learningStats: aiLearningSystem.getLearningState(),
      evolutionStats: evolutionEngine.getEvolutionStats(),
      researchStats: webResearchSystem.getResearchStats(),
    };
  }
}

// Singleton
export const automaticLearning = new AutomaticLearningSystem();

// Auto-start quando o módulo é carregado
if (typeof window !== 'undefined') {
  // Aguarda 5 segundos após carregar para iniciar
  setTimeout(() => {
    automaticLearning.start();
  }, 5000);
  
  console.log('🤖 Sistema de Aprendizado Automático carregado');
  console.log('   ⏰ Iniciará em 5 segundos...');
}
