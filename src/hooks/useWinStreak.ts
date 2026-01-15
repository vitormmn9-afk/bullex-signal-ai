import { useState, useEffect } from 'react';
import { winStreakLearning } from '@/lib/winStreakLearning';

export function useWinStreak() {
  const [stats, setStats] = useState({
    currentStreak: 0,
    targetStreak: 15,
    longestStreak: 0,
  });

  useEffect(() => {
    // Atualizar stats a cada 2 segundos
    const interval = setInterval(() => {
      const streakStats = winStreakLearning.getStats();
      setStats({
        currentStreak: streakStats.currentStreak,
        targetStreak: streakStats.targetStreak,
        longestStreak: streakStats.longestStreak,
      });
    }, 2000);

    // Primeira atualização imediata
    const streakStats = winStreakLearning.getStats();
    setStats({
      currentStreak: streakStats.currentStreak,
      targetStreak: streakStats.targetStreak,
      longestStreak: streakStats.longestStreak,
    });

    return () => clearInterval(interval);
  }, []);

  return stats;
}
