import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { aiCommandSystem, type CommandExecutionResult } from '@/lib/aiCommandSystem';
import {
  Command,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  History,
} from 'lucide-react';

interface ExecutionLog {
  commandId: string;
  input: string;
  result: CommandExecutionResult;
  timestamp: number;
}

export const AICommandPanel: React.FC<{
  onCommandExecuted?: (result: CommandExecutionResult) => void;
}> = ({ onCommandExecuted }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [executionLog, setExecutionLog] = useState<ExecutionLog[]>([]);
  const [activeTab, setActiveTab] = useState('execute');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load execution history
  useEffect(() => {
    const history = aiCommandSystem.getExecutionHistory(20);
    const logs = history.map((cmd, idx) => ({
      commandId: `cmd_${idx}`,
      input: `${cmd.type}: ${JSON.stringify(cmd.payload)}`,
      result: cmd.result || {
        success: false,
        message: 'Sem resultado',
        commandId: cmd.type,
        executionTime: 0,
      },
      timestamp: cmd.executedAt || Date.now(),
    }));
    setExecutionLog(logs);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [executionLog]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.length > 2) {
      const sugg = aiCommandSystem.suggestCommands(value);
      setSuggestions(sugg);
    } else {
      setSuggestions([]);
    }
  };

  const handleExecuteCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsLoading(true);
    setSuggestions([]);

    try {
      const result = await aiCommandSystem.processUserInput(command);

      if (result) {
        setExecutionLog(prev => [
          ...prev,
          {
            commandId: result.commandId,
            input: command,
            result,
            timestamp: Date.now(),
          },
        ]);

        onCommandExecuted?.(result);

        if (result.success) {
          setInput('');
        }
      }
    } catch (error) {
      console.error('Erro ao executar comando:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = () => {
    return aiCommandSystem.getCommandStatistics();
  };

  const stats = getStats();
  const availableCommands = aiCommandSystem.getAvailableCommands();

  return (
    <Card className="h-full flex flex-col bg-slate-900 border-slate-800">
      <CardHeader className="border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Command className="w-5 h-5 text-blue-400" />
              AI Command Center
            </CardTitle>
            <CardDescription className="text-slate-400">
              Execute ações com linguagem natural
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-900/50 text-blue-300 border-blue-800">
              {stats.totalExecuted} comandos
            </Badge>
            <Badge variant="outline" className="bg-green-900/50 text-green-300 border-green-800">
              {Math.round(stats.successRate * 100)}% sucesso
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-b border-slate-700">
            <TabsTrigger
              value="execute"
              className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
            >
              Executar
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
            >
              Histórico
            </TabsTrigger>
            <TabsTrigger
              value="help"
              className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
            >
              Ajuda
            </TabsTrigger>
          </TabsList>

          {/* Execute Tab */}
          <TabsContent value="execute" className="flex-1 flex flex-col gap-3">
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Ex: 'Gera sinal IBOV', 'Aumenta confiança 90%', 'Analisa USD 5m'..."
                value={input}
                onChange={e => handleInputChange(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !isLoading && handleExecuteCommand(input)}
                disabled={isLoading}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(suggestion);
                        setSuggestions([]);
                        inputRef.current?.focus();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg border-b border-slate-700 last:border-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleExecuteCommand(input)}
                disabled={isLoading || !input.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Executar Comando
              </Button>
            </div>

            {/* Resultado da última execução */}
            {executionLog.length > 0 && (
              <div className="border border-slate-700 rounded-lg p-3 bg-slate-800/50">
                <div className="flex items-start gap-2 mb-2">
                  {executionLog[executionLog.length - 1].result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {executionLog[executionLog.length - 1].result.message}
                    </p>
                    <p className="text-xs text-slate-400">
                      Executado em {executionLog[executionLog.length - 1].result.executionTime}ms
                    </p>
                  </div>
                </div>
                {executionLog[executionLog.length - 1].result.data && (
                  <div className="text-xs bg-slate-900 p-2 rounded text-slate-300 font-mono overflow-auto max-h-40">
                    {JSON.stringify(executionLog[executionLog.length - 1].result.data, null, 2)}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 overflow-y-auto">
            <ScrollArea className="h-full border border-slate-700 rounded-lg bg-slate-800/50 p-3">
              <div ref={scrollRef} className="space-y-2 pr-4">
                {executionLog.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhum comando executado ainda</p>
                  </div>
                ) : (
                  executionLog.slice().reverse().map((log, idx) => (
                    <div
                      key={`${log.commandId}_${idx}`}
                      className="border border-slate-700 rounded-lg p-2 bg-slate-900/50"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        {log.result.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-200 break-words">
                            {log.input}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString('pt-BR')} -{' '}
                            {log.result.executionTime}ms
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="flex-1 overflow-y-auto space-y-3">
            <ScrollArea className="h-full border border-slate-700 rounded-lg bg-slate-800/50 p-4">
              <div className="space-y-4 pr-4">
                <div>
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Comandos Disponíveis
                  </h3>
                  <div className="space-y-2">
                    {availableCommands.map((cmd, idx) => (
                      <div key={idx} className="bg-slate-900/50 p-2 rounded border border-slate-700">
                        <p className="text-xs font-semibold text-blue-300 mb-1">{cmd.type}</p>
                        <p className="text-xs text-slate-300 mb-2">{cmd.description}</p>
                        <div className="space-y-1">
                          {cmd.examples.slice(0, 2).map((example, exIdx) => (
                            <p
                              key={exIdx}
                              className="text-xs text-slate-400 italic pl-2 border-l border-slate-600"
                            >
                              "{example}"
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
                  <p className="text-xs text-blue-200">
                    <strong>Dica:</strong> Use linguagem natural para comandos. O sistema entende
                    variações (ex: "ativa gerador" = "liga auto gerar")
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AICommandPanel;
