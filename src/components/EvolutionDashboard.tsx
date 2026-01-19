import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { evolutionEngine, type Strategy } from '@/lib/evolutionEngine';
import { webResearchSystem } from '@/lib/webResearch';
import { Brain, TrendingUp, Target, Zap, BookOpen, Sparkles } from 'lucide-react';

export function EvolutionDashboard() {
  const [stats, setStats] = useState(evolutionEngine.getEvolutionStats());
  const [strategies, setStrategies] = useState(evolutionEngine.getAllStrategies());
  const [researchStats, setResearchStats] = useState(webResearchSystem.getResearchStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(evolutionEngine.getEvolutionStats());
      setStrategies(evolutionEngine.getAllStrategies());
      setResearchStats(webResearchSystem.getResearchStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const progress = (stats.consecutiveWins / stats.targetWins) * 100;

  return (
    <div className="space-y-4">
      {/* Objetivo Principal */}
      <Card className="border-2 border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Objetivo: 15 Vitórias Consecutivas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className="font-bold">{stats.consecutiveWins}/{stats.targetWins} vitórias</span>
            </div>
            <Progress value={progress} className="h-3" />
            {stats.consecutiveWins > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-500">
                  🔥 Em sequência de {stats.consecutiveWins} vitória{stats.consecutiveWins > 1 ? 's' : ''}!
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Motor de Evolução Ativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Geração</div>
              <div className="text-2xl font-bold text-blue-500">#{stats.generation}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Estratégias</div>
              <div className="text-2xl font-bold">{stats.totalStrategies}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Melhor WR</div>
              <div className="text-2xl font-bold text-green-500">
                {stats.bestStrategy.winRate.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Maior Streak</div>
              <div className="text-2xl font-bold text-purple-500">
                {stats.bestStrategy.maxStreak}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Melhor Estratégia Atual:</div>
            <Badge variant="default" className="text-sm">
              {stats.bestStrategy.name} ({stats.bestStrategy.wins}W - {stats.bestStrategy.losses}L)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Estratégias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top 5 Estratégias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topStrategies.map((strategy, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                  <div>
                    <div className="font-semibold text-sm">{strategy.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Gen {strategy.generation} • {strategy.wins}W-{strategy.losses}L
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={parseFloat(strategy.winRate) >= 70 ? 'default' : 'secondary'}
                  className="text-lg font-bold"
                >
                  {strategy.winRate}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Pesquisa Web */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-500" />
            Aprendizado Web Ativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Tópicos em Cache</div>
              <div className="text-2xl font-bold">{researchStats.cachedTopics}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total de Buscas</div>
              <div className="text-2xl font-bold">{researchStats.totalSearches}</div>
            </div>
          </div>

          {researchStats.recentSearches.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-2">Pesquisas Recentes:</div>
              <div className="space-y-1 text-xs">
                {researchStats.recentSearches.slice(0, 5).map((search, index) => (
                  <div key={index} className="flex justify-between items-center p-1 bg-muted rounded">
                    <span className="truncate">{search.topic}</span>
                    <Badge variant="outline" className="text-xs ml-2">{search.source}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status de Aprendizado */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-sm">Sistema em Evolução Contínua</div>
              <div className="text-xs text-muted-foreground">
                A IA está constantemente experimentando novas estratégias, aprendendo com cada resultado
                e evoluindo suas táticas. Estratégias com baixa performance são automaticamente mutadas
                e melhoradas. O sistema busca conhecimento na web para se aprimorar continuamente.
              </div>
              <div className="text-xs text-yellow-600 font-semibold mt-2">
                🎯 Foco atual: Alcançar {stats.targetWins} vitórias consecutivas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes das Estratégias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Todas as Estratégias ({strategies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {strategies
              .sort((a, b) => b.performance.winRate - a.performance.winRate)
              .map((strategy) => (
                <div key={strategy.id} className="p-3 bg-muted rounded-lg text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-semibold">{strategy.name}</div>
                      <div className="text-muted-foreground">{strategy.description}</div>
                    </div>
                    <Badge 
                      variant={strategy.performance.winRate >= 70 ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {strategy.performance.winRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-muted-foreground">
                    <span>Gen: {strategy.generation}</span>
                    <span>W: {strategy.performance.wins}</span>
                    <span>L: {strategy.performance.losses}</span>
                    <span>Streak: {strategy.performance.consecutiveWins}</span>
                    <span>Max: {strategy.performance.maxConsecutiveWins}</span>
                  </div>
                  {strategy.mutations.length > 0 && (
                    <div className="mt-1 text-muted-foreground italic">
                      {strategy.mutations[strategy.mutations.length - 1]}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
