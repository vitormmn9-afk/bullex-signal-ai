import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import { winStreakLearning } from '@/lib/winStreakLearning';
import type { WinStreakStats } from '@/lib/winStreakLearning';

export function WinStreakMonitor() {
  const [stats, setStats] = useState<WinStreakStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar stats iniciais
    loadStats();

    // Atualizar a cada 5 segundos
    const interval = setInterval(loadStats, 5000);

    // Listener para eventos de atualização
    const handleLearningUpdate = () => {
      loadStats();
    };

    window.addEventListener('ai-learning-updated', handleLearningUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('ai-learning-updated', handleLearningUpdate);
    };
  }, []);

  const loadStats = () => {
    try {
      const streakStats = winStreakLearning.getStats();
      setStats(streakStats);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar stats de streak:', error);
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Sistema de Win Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = (stats.currentStreak / stats.targetStreak) * 100;
  const isCloseToTarget = stats.currentStreak >= stats.targetStreak * 0.7;
  const hasActiveStreak = stats.currentStreak > 0;

  return (
    <div className="space-y-4">
      {/* Card Principal de Streak */}
      <Card className={hasActiveStreak ? 'border-orange-500 shadow-lg' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasActiveStreak ? (
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            ) : (
              <Flame className="w-5 h-5 text-gray-400" />
            )}
            Sistema de Win Streaks
            {hasActiveStreak && (
              <Badge variant="default" className="ml-auto bg-orange-500">
                🔥 ATIVA
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Treinamento para sequências de vitórias consecutivas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Streak Atual */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                Streak Atual
              </span>
              <span className={`text-2xl font-bold ${hasActiveStreak ? 'text-orange-500' : 'text-gray-400'}`}>
                {stats.currentStreak}
              </span>
            </div>
            
            {/* Barra de Progresso */}
            <div className="space-y-1">
              <Progress 
                value={progressPercent} 
                className={`h-3 ${isCloseToTarget ? 'bg-orange-100' : ''}`}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{stats.currentStreak} / {stats.targetStreak} vitórias</span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
            </div>

            {/* Mensagem de Status */}
            {isCloseToTarget && hasActiveStreak && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-700 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Quase lá! Faltam {stats.targetStreak - stats.currentStreak} vitórias para o target!
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Modo conservador ativado - apenas sinais de alta confiança
                </p>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1 text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <Trophy className="w-5 h-5 mx-auto text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-700">{stats.longestStreak}</div>
              <div className="text-xs text-yellow-600">Recorde</div>
            </div>

            <div className="space-y-1 text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <Target className="w-5 h-5 mx-auto text-blue-600" />
              <div className="text-2xl font-bold text-blue-700">{stats.targetStreak}</div>
              <div className="text-xs text-blue-600">Target Atual</div>
            </div>

            <div className="space-y-1 text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <TrendingUp className="w-5 h-5 mx-auto text-purple-600" />
              <div className="text-2xl font-bold text-purple-700">{stats.progressionLevel}</div>
              <div className="text-xs text-purple-600">Nível</div>
            </div>
          </div>

          {/* 🔥 ALERTA DE DERROTAS CONSECUTIVAS */}
          {stats.currentLossStreak > 0 && (
            <div className={`p-3 rounded-lg border ${
              stats.currentLossStreak >= 4 
                ? 'bg-red-50 border-red-300' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    stats.currentLossStreak >= 4 ? 'text-red-800' : 'text-orange-800'
                  }`}>
                    {stats.currentLossStreak} derrota{stats.currentLossStreak > 1 ? 's' : ''} consecutiva{stats.currentLossStreak > 1 ? 's' : ''}
                  </p>
                  <p className={`text-xs mt-1 ${
                    stats.currentLossStreak >= 4 ? 'text-red-700' : 'text-orange-700'
                  }`}>
                    {stats.currentLossStreak >= 4 
                      ? `🚨 Próxima derrota = RESET! A IA vai recalibrar após 5 derrotas.`
                      : `Faltam ${5 - stats.currentLossStreak} para reset automático`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informação sobre resets */}
          {stats.totalResets > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                🔄 {stats.totalResets} reset{stats.totalResets > 1 ? 's' : ''} realizado{stats.totalResets > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                A IA recalibra automaticamente após 5 derrotas consecutivas, aprendendo com os erros
              </p>
            </div>
          )}

          {/* Conquistas */}
          {Object.keys(stats.streaksAchieved).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-600" />
                Conquistas Desbloqueadas
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.streaksAchieved)
                  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                  .map(([target, count]) => (
                    <Badge 
                      key={target} 
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 border-yellow-300"
                    >
                      🏆 {target} vitórias {count > 1 ? `(×${count})` : ''}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Histórico de Streaks Recentes */}
          {stats.streakHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Histórico Recente</h4>
              <div className="space-y-1">
                {stats.streakHistory.slice(-5).reverse().map((record, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="font-medium">{record.streak} vitórias</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{record.averageProbability.toFixed(0)}% prob</span>
                      <span>•</span>
                      <span>{new Date(record.endTimestamp).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próxima Meta */}
          {stats.currentStreak > 0 && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-full">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900">Próxima Meta</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    {stats.currentStreak < stats.targetStreak ? (
                      <>
                        Alcançar <strong>{stats.targetStreak}</strong> vitórias consecutivas
                        {' '}para desbloquear o próximo nível!
                      </>
                    ) : (
                      <>
                        Meta atual atingida! Continue operando para aumentar o target para{' '}
                        <strong>{stats.targetStreak + 5}</strong> vitórias.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Motivação quando sem streak */}
          {!hasActiveStreak && (
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-full">
                  <Zap className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Iniciar Nova Streak</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    Objetivo: <strong>{stats.targetStreak}</strong> vitórias consecutivas
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 A IA está aprendendo a operar com mais precisão em sequências longas
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Sistema de Progressão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Sistema de Progressão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">
            <p className="mb-2">
              <strong>Como funciona:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Target inicial: <strong>15 vitórias</strong> consecutivas</li>
              <li>A cada meta atingida: <strong>+5 vitórias</strong> no próximo target</li>
              <li>🔄 Reset automático após <strong>5 derrotas</strong> consecutivas</li>
              <li>Sistema recalibra e aprende com os erros após cada reset</li>
              <li>Modo conservador ativo quando próximo do target</li>
              <li>Análise avançada de <strong>padrões de velas</strong>: quadrantes, cores, sequências</li>
              <li>Previsão probabilística da <strong>próxima vela</strong></li>
            </ul>
          </div>

          {stats.progressionLevel > 1 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                🎉 Nível {stats.progressionLevel} Desbloqueado!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Você já dominou {stats.progressionLevel - 1} níveis de dificuldade
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
