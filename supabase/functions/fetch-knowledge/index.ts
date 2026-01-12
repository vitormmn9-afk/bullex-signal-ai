// Supabase Edge Function: fetch-knowledge
// Busca conhecimento público (Wikipedia) e retorna insights estruturados
// Atenção: respeita direitos autorais e usa fontes abertas

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface FetchBody {
  topic?: string;
  keywords?: string[];
}

interface Insight {
  source: string;
  title: string;
  url: string;
  summary: string;
}

async function searchWikipedia(query: string): Promise<Insight[]> {
  const api = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&utf8=1&srlimit=5`;
  const res = await fetch(api);
  if (!res.ok) return [];
  const data = await res.json();
  const items: any[] = data?.query?.search || [];
  const insights: Insight[] = [];

  for (const item of items) {
    const title: string = item?.title;
    const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s/g, '_'))}`;
    // Summary via REST
    const sumRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s/g, '_'))}`);
    let summary = '';
    if (sumRes.ok) {
      const sumData = await sumRes.json();
      summary = sumData?.extract || '';
    }
    insights.push({ source: 'wikipedia', title, url: pageUrl, summary });
  }

  return insights;
}

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
    }
    const body: FetchBody = await req.json();
    const query = [body.topic, ...(body.keywords || [])].filter(Boolean).join(' ');
    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing topic/keywords' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const insights = await searchWikipedia(query);
    return new Response(JSON.stringify({ insights }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
});
