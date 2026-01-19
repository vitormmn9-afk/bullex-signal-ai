import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, HardDrive, CheckCircle, XCircle } from 'lucide-react';
import { aiLearningSystem } from '@/lib/aiLearning';
import { winStreakLearning } from '@/lib/winStreakLearning';

interface StorageInfo {
  key: string;
  name: string;
  exists: boolean;
  size: number;
  data?: any;
}

export function PersistenceStatus() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo[]>([]);
  const [totalSize, setTotalSize] = useState(0);

  const checkStorage = () => {
    const items: StorageInfo[] = [
      {
        key: 'bullex_ai_learning_history',
        name: 'Histórico de Sinais',
        exists: false,
        size: 0
      },
      {
        key: 'bullex_ai_learning_state',
        name: 'Estado de Aprendizado',
        exists: false,
        size: 0
      },
      {
        key: 'bullex_ai_operational_config',
        name: 'Config Operacional',
        exists: false,
        size: 0
      },
      {
        key: 'win_streak_learning',
        name: 'Win Streak Learning',
        exists: false,
        size: 0
      },
      {
        key: 'ai_metrics',
        name: 'Métricas da IA',
        exists: false,
        size: 0
      },
      {
        key: 'ai_operation_learnings',
        name: 'Operações Aprendidas',
        exists: false,
        size: 0
      }
    ];

    let total = 0;

    items.forEach(item => {
      const value = localStorage.getItem(item.key);
      if (value) {
        item.exists = true;
        item.size = new Blob([value]).size;
        total += item.size;
        try {
          item.data = JSON.parse(value);
        } catch (e) {
          // ignore
        }
      }
    });

    setStorageInfo(items);
    setTotalSize(total);
  };

  useEffect(() => {
    checkStorage();
    const interval = setInterval(checkStorage, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const learningState = aiLearningSystem.getLearningState();
  const history = aiLearningSystem.getHistory();
  const streakStats = winStreakLearning.getStats();

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Status de Persistência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Resumo Geral */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-3 rounded-lg border border-blue-500/20">
              <div className="text-sm text-muted-foreground">Total Salvo</div>
              <div className="text-2xl font-bold text-blue-500">{formatBytes(totalSize)}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-3 rounded-lg border border-green-500/20">
              <div className="text-sm text-muted-foreground">Sinais</div>
              <div className="text-2xl font-bold text-green-500">{history.length}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-3 rounded-lg border border-purple-500/20">
              <div className="text-sm text-muted-foreground">Win Rate</div>
              <div className="text-2xl font-bold text-purple-500">{learningState.winRate.toFixed(1)}%</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 p-3 rounded-lg border border-orange-500/20">
              <div className="text-sm text-muted-foreground">Fase IA</div>
              <div className="text-2xl font-bold text-orange-500">{learningState.evolutionPhase}</div>
            </div>
          </div>

          {/* Detalhes de Storage */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Dados Armazenados
            </h4>
            <div className="space-y-1">
              {storageInfo.map(item => (
                <div 
                  key={item.key}
                  className="flex items-center justify-between p-2 rounded bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {item.exists ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.exists && item.data && (
                      <span className="text-xs text-muted-foreground">
                        {Array.isArray(item.data) ? `${item.data.length} itens` : 'Configurado'}
                      </span>
                    )}
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatBytes(item.size)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info de Win Streak */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-3 rounded-lg border border-yellow-500/20">
            <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
              🔥 Win Streak System
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Atual</div>
                <div className="font-bold">{streakStats.currentStreak}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Recorde</div>
                <div className="font-bold">{streakStats.longestStreak}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Target</div>
                <div className="font-bold">{streakStats.targetStreak}</div>
              </div>
            </div>
          </div>

          {/* Padrões Aprendidos */}
          {Object.keys(learningState.patternSuccessRates).length > 0 && (
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-3 rounded-lg border border-indigo-500/20">
              <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                📊 Padrões Aprendidos
              </div>
              <div className="text-xs text-muted-foreground">
                {Object.keys(learningState.patternSuccessRates).length} padrões com dados históricos
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(learningState.patternSuccessRates)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([pattern, rate]) => (
                    <span 
                      key={pattern}
                      className={`text-xs px-2 py-1 rounded ${
                        rate > 60 
                          ? 'bg-green-500/20 text-green-600' 
                          : rate > 40 
                          ? 'bg-yellow-500/20 text-yellow-600'
                          : 'bg-red-500/20 text-red-600'
                      }`}
                    >
                      {pattern}: {rate.toFixed(0)}%
                    </span>
                  ))}
              </div>
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground pt-2 border-t">
            💾 Todos os dados são salvos automaticamente no localStorage do navegador
            <br />
            Seu aprendizado permanece mesmo após fechar o app
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
