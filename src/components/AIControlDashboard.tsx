import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { aiTrainingChat } from '@/lib/aiTrainingChat';
import { bullexIntegration } from '@/lib/bullexIntegration';
import { advancedMarketLearning } from '@/lib/advancedMarketLearning';
import { aiCommandSystem } from '@/lib/aiCommandSystem';
import AITrainingPanel from './AITrainingPanel';
import AICommandPanel from './AICommandPanel';
import AIAutoAnalysisPanel from './AIAutoAnalysisPanel';
import {
  Brain,
  TrendingUp,
  BookOpen,
  Zap,
  BarChart3,
  Target,
  Users,
} from 'lucide-react';

export const AIControlDashboard: React.FC = () => {
  const [aiStatus, setAIStatus] = useState<any>(null);
  const [bullexStats, setBullexStats] = useState<any>(null);
  const [marketStats, setMarketStats] = useState<any>(null);
  const [commandStats, setCommandStats] = useState<any>(null);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    setAIStatus(aiTrainingChat.getAIStatus());
    setBullexStats({
      assets: bullexIntegration.getAllAssets().length,
      strategies: bullexIntegration.getAllStrategies().length,
    });
    setMarketStats(advancedMarketLearning.getLearningStats());
    setCommandStats(aiCommandSystem.getCommandStatistics());
  };

  return (
    <div className="w-full space-y-6 bg-slate-950 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          AI Trading Evolution System
        </h1>
        <p className="text-slate-400">
          Sistema avançado de IA com aprendizado contínuo, buscas de mercado e comandos automáticos
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* IA Status */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-900/10 border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-purple-300 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Capacidade da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiStatus && (
              <>
                <div className="text-2xl font-bold text-white">
                  {Math.round(aiStatus.avgSuccessRate * 100)}%
                </div>
                <p className="text-xs text-purple-300">Taxa de Sucesso</p>
                <Progress
                  value={aiStatus.avgSuccessRate * 100}
                  className="mt-2 bg-purple-900/30 h-1"
                />
                <div className="text-xs text-slate-400 mt-2">
                  {aiStatus.totalMessagesProcessed} mensagens processadas
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bullex Knowledge */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Conhecimento Bullex
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bullexStats && (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Ativos:</span>
                    <span className="text-lg font-bold text-blue-300">{bullexStats.assets}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Estratégias:</span>
                    <span className="text-lg font-bold text-blue-300">{bullexStats.strategies}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Market Learning */}
        <Card className="bg-gradient-to-br from-green-900/20 to-green-900/10 border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-green-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Aprendizado de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {marketStats && (
              <>
                <div className="text-2xl font-bold text-white">{marketStats.totalEntriesLearned}</div>
                <p className="text-xs text-green-300">Entradas aprendidas</p>
                <div className="text-xs text-slate-400 mt-2">
                  Taxa: {Math.round(marketStats.successRate * 100)}%
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Commands Executed */}
        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-900/10 border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-orange-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Comandos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commandStats && (
              <>
                <div className="text-2xl font-bold text-white">{commandStats.totalExecuted}</div>
                <p className="text-xs text-orange-300">Executados</p>
                <div className="text-xs text-slate-400 mt-2">
                  Sucesso: {Math.round(commandStats.successRate * 100)}%
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
          <TabsTrigger
            value="training"
            className="data-[state=active]:bg-purple-900 data-[state=active]:text-white gap-2"
          >
            <Brain className="w-4 h-4" />
            Treinamento
          </TabsTrigger>
          <TabsTrigger
            value="commands"
            className="data-[state=active]:bg-blue-900 data-[state=active]:text-white gap-2"
          >
            <Zap className="w-4 h-4" />
            Comandos
          </TabsTrigger>
          <TabsTrigger
            value="auto-analysis"
            className="data-[state=active]:bg-cyan-900 data-[state=active]:text-white gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Auto-Analysis
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-green-900 data-[state=active]:text-white gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="space-y-4">
          <AITrainingPanel />
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          <AICommandPanel />
        </TabsContent>

        <TabsContent value="auto-analysis" className="space-y-4">
          <AIAutoAnalysisPanel />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* IA Capabilities Details */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Capacidades da IA</CardTitle>
                <CardDescription>Evolução de cada habilidade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiStatus?.capabilityList.map((cap: any) => (
                  <div key={cap.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{cap.name}</span>
                      <Badge className="bg-green-900/50 text-green-300">
                        {Math.round(cap.successRate * 100)}%
                      </Badge>
                    </div>
                    <Progress value={cap.successRate * 100} className="h-2" />
                    <p className="text-xs text-slate-400">{cap.trainingSessions} sessões</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Market Categories */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Categorias de Aprendizado</CardTitle>
                <CardDescription>Distribuição de conhecimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {marketStats?.topCategories.map((category: string, idx: number) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{category}</span>
                    <Badge className="bg-blue-900/50 text-blue-300">{(idx + 1) * 20}%</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Insights & Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                  <p className="text-sm text-slate-200 mb-2">
                    <strong>🎯 Meta Atual:</strong> Melhorar Taxa de Sucesso da IA para 75%+
                  </p>
                  <p className="text-xs text-slate-400">
                    A IA aprendeu {marketStats?.totalEntriesLearned || 0} conceitos diferentes e
                    processou {aiStatus?.totalMessagesProcessed || 0} mensagens.
                  </p>
                </div>

                <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                  <p className="text-sm text-slate-200 mb-2">
                    <strong>💡 Recomendações:</strong>
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 ml-4">
                    <li>• Continue alimentando feedback nos sinais para melhorar precisão</li>
                    <li>• Explore análise de divergências para melhorar reversões</li>
                    <li>• Teste novos padrões de velas em diferentes timeframes</li>
                    <li>• Mantenha diálogo com a IA para evolução contínua</li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                  <p className="text-sm text-slate-200 mb-2">
                    <strong>📊 Última Atualização:</strong>
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date().toLocaleString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIControlDashboard;
