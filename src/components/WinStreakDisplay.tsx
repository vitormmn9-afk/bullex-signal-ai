import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Zap, TrendingUp } from "lucide-react";

interface WinStreakDisplayProps {
  currentStreak: number;
  targetStreak: number;
  longestStreak: number;
}

export function WinStreakDisplay({ currentStreak, targetStreak, longestStreak }: WinStreakDisplayProps) {
  const progress = (currentStreak / targetStreak) * 100;
  const isClose = progress >= 70;
  const isVeryClose = progress >= 90;

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Sequência de Vitórias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak Atual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Meta: {targetStreak} vitórias</span>
            <Badge variant={isVeryClose ? "default" : isClose ? "secondary" : "outline"}>
              {currentStreak}/{targetStreak}
            </Badge>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {currentStreak === 0 && "🎯 Aguardando primeira vitória..."}
            {currentStreak > 0 && currentStreak < targetStreak && `🔥 ${targetStreak - currentStreak} vitórias restantes!`}
            {currentStreak >= targetStreak && "🎉 META ALCANÇADA! Sistema pronto!"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card/50 p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Atual</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{currentStreak}</p>
          </div>
          
          <div className="bg-card/50 p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Recorde</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{longestStreak}</p>
          </div>
        </div>

        {/* Aviso */}
        {currentStreak > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              ⚠️ Ao errar, o contador zera e a IA aprende com o erro para não repetir!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
