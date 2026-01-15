import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export function SignalGenerationMonitor() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Capturar logs do console
    const originalLog = console.log;
    
    console.log = function(...args) {
      const message = args.join(' ');
      
      // Filtrar apenas logs relevantes de geração de sinais
      if (
        message.includes('SINAL REJEITADO') ||
        message.includes('SINAL APROVADO') ||
        message.includes('Probabilidade final') ||
        message.includes('Padrão') ||
        message.includes('Win Rate') ||
        message.includes('Trend Strength') ||
        message.includes('S/R')
      ) {
        let type: 'info' | 'success' | 'error' | 'warning' = 'info';
        
        if (message.includes('REJEITADO')) {
          type = 'error';
        } else if (message.includes('APROVADO')) {
          type = 'success';
        } else if (message.includes('⚠️')) {
          type = 'warning';
        }

        setLogs(prev => [
          {
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            message,
            type
          },
          ...prev
        ].slice(0, 50)); // Manter apenas últimas 50 entradas
      }
      
      originalLog.apply(console, args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  return (
    <Card className="bg-black/50 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Monitor de Geração de Sinais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Aguardando geração de sinais...
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`p-2 rounded text-xs font-mono ${
                log.type === 'error' ? 'bg-red-950/50 text-red-300' :
                log.type === 'success' ? 'bg-green-950/50 text-green-300' :
                log.type === 'warning' ? 'bg-yellow-950/50 text-yellow-300' :
                'bg-gray-900/50 text-gray-300'
              }`}
            >
              <span className="text-gray-500">[{log.timestamp}]</span>{' '}
              {log.message}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
