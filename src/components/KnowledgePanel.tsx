import { memo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Database } from "lucide-react";
import { webLearningSystem } from "@/lib/webIntegration";

interface Insight {
  source: string;
  title: string;
  url?: string;
  summary: string;
  topic?: string;
}

export const KnowledgePanel = memo(function KnowledgePanel() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState<string>("");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFromSupabase = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const supa: any = supabase as any;
      const { data } = await supa.from('ai_insights').select('*').order('created_at', { ascending: false }).limit(100);
      const list: Insight[] = (data || []).map((row: any) => ({ source: row.source, title: row.title, url: row.url || undefined, summary: row.summary, topic: row.topic || undefined }));
      setInsights(list);
    } catch {
      // ignore
    }
  };

  useEffect(() => { fetchFromSupabase(); }, []);

  const search = async () => {
    setLoading(true);
    try {
      const kws = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const res = await webLearningSystem.searchMarketKnowledge(topic || 'análise técnica', kws);
      const list = res.map(r => ({ source: r.source, title: r.content.split(':')[0], url: undefined, summary: r.content, topic }));
      setInsights(prev => [...list, ...prev].slice(0, 100));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4" />
        <span className="text-sm font-medium">Base de Conhecimento</span>
      </div>
      <div className="flex gap-2">
        <Input placeholder="Tópico (ex: padrões de velas)" value={topic} onChange={e => setTopic(e.target.value)} />
        <Input placeholder="Palavras-chave (separadas por vírgula)" value={keywords} onChange={e => setKeywords(e.target.value)} />
        <Button onClick={search} disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</Button>
        <Button variant="outline" onClick={fetchFromSupabase}><Database className="w-4 h-4 mr-2" />Histórico</Button>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum insight ainda. Faça uma busca ou carregue histórico.</div>
      ) : (
        <div className="space-y-3">
          {insights.map((i, idx) => (
            <Card key={idx} className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant="outline">{i.source}</Badge>
                  {i.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{i.summary}</p>
                {i.url && (
                  <a href={i.url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Abrir fonte</a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});
