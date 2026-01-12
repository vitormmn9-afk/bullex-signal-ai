import { memo, useEffect, useState } from "react";
import { aiEvolutionTracker, type OperationLearning } from "@/lib/aiEvolutionTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Filter, NotebookPen, RefreshCw } from "lucide-react";

export const AILearningLogPanel = memo(function AILearningLogPanel() {
  const [entries, setEntries] = useState<OperationLearning[]>([]);
  const [filter, setFilter] = useState<"ALL" | "WIN" | "LOSS">("ALL");
  const [assetFilter, setAssetFilter] = useState<string>("");
  const [source, setSource] = useState<"local" | "supabase">("local");

  const refresh = async () => {
    if (source === 'local') {
      const list = aiEvolutionTracker.getOperationLearnings(200);
      setEntries(list);
    } else {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const supa: any = supabase as any;
        let query = supa.from('ai_operation_learnings').select('*').order('timestamp', { ascending: false }).limit(200);
        if (filter !== 'ALL') query = query.eq('result', filter);
        if (assetFilter) query = query.ilike('asset', `%${assetFilter}%`);
        const { data } = await query;
        const mapped: OperationLearning[] = (data || []).map((row: any) => ({
          id: row.id,
          timestamp: new Date(row.timestamp).getTime(),
          signalId: row.signal_id,
          asset: row.asset,
          direction: row.direction,
          result: row.result,
          indicators: row.indicators || [],
          candlePattern: row.candle_pattern || undefined,
          learned: row.learned,
          implemented: row.implemented || [],
        }));
        setEntries(mapped);
      } catch {
        const list = aiEvolutionTracker.getOperationLearnings(200);
        setEntries(list);
      }
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60000);
    return () => clearInterval(id);
  }, [filter, assetFilter, source]);

  const display = entries
    .filter(e => filter === "ALL" || e.result === filter)
    .slice()
    .reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookPen className="w-4 h-4" />
          <span className="text-sm font-medium">Aprendizados por Operação</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter(filter === "ALL" ? "WIN" : filter === "WIN" ? "LOSS" : "ALL")}
          >
            <Filter className="w-4 h-4 mr-2" />
            {filter === "ALL" ? "Todos" : filter === "WIN" ? "Vitórias" : "Perdas"}
          </Button>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as any)}
            className="text-xs bg-background/50 border border-border/50 rounded px-2 py-1"
          >
            <option value="local">Local</option>
            <option value="supabase">Supabase</option>
          </select>
          <input
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            placeholder="Filtrar por ativo"
            className="text-xs bg-background/50 border border-border/50 rounded px-2 py-1"
          />
        </div>
      </div>

      {display.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <NotebookPen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum aprendizado registrado ainda.</p>
          <p className="text-sm">Registre os resultados das operações para ver os aprendizados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {display.map(entry => (
            <Card key={entry.id} className="bg-card/50 border-border/50">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {entry.asset} · {entry.direction} · {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </CardTitle>
                  <Badge variant={entry.result === 'WIN' ? 'default' : 'destructive'}>
                    {entry.result === 'WIN' ? 'Vitória' : 'Perda'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.indicators.map(ind => (
                    <Badge key={ind} variant="outline">{ind}</Badge>
                  ))}
                  {entry.candlePattern && (
                    <Badge variant="secondary">{entry.candlePattern}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">O que a IA aprendeu</span>
                  <p className="text-sm mt-1">{entry.learned}</p>
                </div>
                <Separator />
                <div>
                  <span className="text-xs font-medium text-muted-foreground">O que foi implantado no operacional</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.implemented.map((impl, idx) => (
                      <Badge key={idx} variant="secondary">{impl}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});
