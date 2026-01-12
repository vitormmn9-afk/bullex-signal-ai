import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aiSignalAnalyzer, type SignalAnalysis } from '@/lib/aiSignalAnalyzer';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export const AIAutoAnalysisPanel: React.FC = () => {
  const [analyzedSignals, setAnalyzedSignals] = useState<SignalAnalysis[]>([]);
  const [activeSignals, setActiveSignals] = useState<SignalAnalysis[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>('IBOV');
  const [assetStats, setAssetStats] = useState<any>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Atualizar a cada 5s
    return () => clearInterval(interval);
  }, [selectedAsset]);

  const loadData = () => {
    setAnalyzedSignals(aiSignalAnalyzer.getAnalyzedSignals(50));
    setActiveSignals(aiSignalAnalyzer.getActiveSignals());
    setStats(aiSignalAnalyzer.getStatistics());
    setChartData(aiSignalAnalyzer.getChartData());
    setAssetStats(aiSignalAnalyzer.getAnalysisByAsset(selectedAsset));
  };

  const getStatusColor = (status: string) => {
    if (status === 'WIN') return 'bg-green-900/50 text-green-300';
    if (status === 'LOSS') return 'bg-red-900/50 text-red-300';
    return 'bg-yellow-900/50 text-yellow-300';
  };

  const getStatusIcon = (result: string | null) => {
    if (result === 'WIN') return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    if (result === 'LOSS') return <XCircle className="w-4 h-4 text-red-400" />;
    return null;
  };

  const pieData = stats
    ? [
        { name: 'Vitórias', value: stats.wins, fill: '#22c55e' },
        { name: 'Perdas', value: stats.losses, fill: '#ef4444' },
      ]
    : [];

  return (
    <Card className="h-full flex flex-col bg-slate-900 border-slate-800">
      <CardHeader className="border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Análise Automática de Sinais
            </CardTitle>
            <CardDescription className="text-slate-400">
              A IA marca automaticamente WIN/LOSS dos seus sinais
            </CardDescription>
          </div>
          {stats && (
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-400">Taxa de Vitória</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-b border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-cyan-900 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="data-[state=active]:bg-cyan-900 data-[state=active]:text-white"
            >
              Histórico
            </TabsTrigger>
            <TabsTrigger
              value="ativo"
              className="data-[state=active]:bg-cyan-900 data-[state=active]:text-white"
            >
              Por Ativo
            </TabsTrigger>
            <TabsTrigger
              value="ativo"
              className="data-[state=active]:bg-cyan-900 data-[state=active]:text-white"
            >
              Ativos
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {stats && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-green-900/20 to-green-900/10 border border-green-800 rounded-lg p-3">
                    <p className="text-xs text-green-300 mb-1">Vitórias</p>
                    <p className="text-2xl font-bold text-white">{stats.wins}</p>
                    <p className="text-xs text-slate-400">
                      Média: +{stats.averageProfitPerWin.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-900/20 to-red-900/10 border border-red-800 rounded-lg p-3">
                    <p className="text-xs text-red-300 mb-1">Perdas</p>
                    <p className="text-2xl font-bold text-white">{stats.losses}</p>
                    <p className="text-xs text-slate-400">
                      Média: {stats.averageLossPerLoss.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 border border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-300 mb-1">Lucro Total</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalProfit.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">Valor acumulado</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-900/10 border border-yellow-800 rounded-lg p-3">
                    <p className="text-xs text-yellow-300 mb-1">Profit Factor</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.profitFactor.toFixed(2)}x
                    </p>
                    <p className="text-xs text-slate-400">Ganho/Perda</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Win/Loss Pie Chart */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-white mb-3">
                      Distribuição Win/Loss
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => value} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Daily Performance */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-white mb-3">Desempenho Diário</h3>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: '1px solid #475569',
                            }}
                          />
                          <Legend />
                          <Bar dataKey="wins" fill="#22c55e" />
                          <Bar dataKey="losses" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-slate-400 text-sm">Aguardando dados...</p>
                    )}
                  </div>
                </div>

                {/* Profit/Loss Chart */}
                {chartData.length > 0 && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-white mb-3">Lucro/Perda Diário</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                          }}
                          formatter={(value: any) => value.toFixed(2)}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="profitLoss"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          dot={{ fill: '#06b6d4' }}
                          name="Lucro/Perda"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Histórico Tab */}
          <TabsContent value="historico" className="space-y-2">
            <ScrollArea className="h-96 border border-slate-700 rounded-lg bg-slate-800/50 p-3">
              <div className="space-y-2 pr-4">
                {analyzedSignals.length === 0 ? (
                  <p className="text-slate-400 text-sm">Nenhum sinal analisado ainda</p>
                ) : (
                  analyzedSignals
                    .slice()
                    .reverse()
                    .map(signal => (
                      <div
                        key={signal.signalId}
                        className="border border-slate-700 rounded-lg p-2 bg-slate-900/50 flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(signal.result)}
                            <span className="font-semibold text-white text-sm">
                              {signal.asset} {signal.direction}
                            </span>
                            <Badge
                              className={`text-xs ${getStatusColor(signal.status)}`}
                            >
                              {signal.result}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mb-1">
                            {signal.analysisReason}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>
                              {signal.entryPrice.toFixed(2)} → {signal.exitPrice?.toFixed(2)}
                            </span>
                            <span
                              className={`font-semibold ${
                                (signal.profitLoss || 0) > 0
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {(signal.profitLoss || 0).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-xs text-slate-400">
                            {new Date(signal.exitTime || Date.now()).toLocaleTimeString('pt-BR')}
                          </p>
                          <p className="text-xs text-slate-500">
                            Conf: {signal.confidence}%
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Por Ativo Tab */}
          <TabsContent value="ativo" className="space-y-3">
            <div className="flex gap-2 mb-3">
              {['IBOV', 'USD', 'PETR4', 'VALE3', 'BTC', 'MGLU3'].map(asset => (
                <button
                  key={asset}
                  onClick={() => setSelectedAsset(asset)}
                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                    selectedAsset === asset
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {asset}
                </button>
              ))}
            </div>

            {assetStats && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Total de Trades</p>
                    <p className="text-2xl font-bold text-white">{assetStats.totalTrades}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Taxa de Vitória</p>
                    <p className="text-2xl font-bold text-white">
                      {assetStats.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Vitórias</p>
                    <p className="text-2xl font-bold text-green-400">{assetStats.wins}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Perdas</p>
                    <p className="text-2xl font-bold text-red-400">{assetStats.losses}</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Lucro/Perda Total</p>
                  <p
                    className={`text-3xl font-bold ${
                      assetStats.totalProfit > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {assetStats.totalProfit.toFixed(2)}
                  </p>
                  <Progress
                    value={Math.min(100, (assetStats.totalProfit / 100) * 100)}
                    className="mt-2"
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Sinais Ativos Tab */}
          <TabsContent value="ativos" className="space-y-2">
            <ScrollArea className="h-96 border border-slate-700 rounded-lg bg-slate-800/50 p-3">
              <div className="space-y-2 pr-4">
                {activeSignals.length === 0 ? (
                  <p className="text-slate-400 text-sm">Nenhum sinal ativo no momento</p>
                ) : (
                  activeSignals.map(signal => (
                    <div
                      key={signal.signalId}
                      className="border border-yellow-700/50 rounded-lg p-2 bg-yellow-900/10 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                          <span className="font-semibold text-white text-sm">
                            {signal.asset} {signal.direction}
                          </span>
                          <Badge className="bg-yellow-900/50 text-yellow-300 text-xs">
                            ANALISANDO
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">
                          Entrada: {signal.entryPrice.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>Tempo: {((Date.now() - signal.entryTime) / 1000).toFixed(0)}s</span>
                          <span>Conf: {signal.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIAutoAnalysisPanel;
