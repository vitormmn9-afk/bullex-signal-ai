import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PerformanceChartProps {
  data: {
    name: string;
    wins: number;
    losses: number;
  }[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card className="p-4 bg-gradient-card border-border/50">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Performance por Dia
      </h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222 47% 10%)',
                border: '1px solid hsl(222 30% 18%)',
                borderRadius: '8px',
                color: 'hsl(210 40% 98%)',
              }}
            />
            <Bar dataKey="wins" stackId="a" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`wins-${index}`} fill="hsl(142 76% 46%)" />
              ))}
            </Bar>
            <Bar dataKey="losses" stackId="a" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`losses-${index}`} fill="hsl(0 84% 60%)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
