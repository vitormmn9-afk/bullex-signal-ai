/**
 * Sistema de analytics interno para rastrear performance e uso
 */

interface AnalyticsEvent {
  type: 'signal_generated' | 'signal_win' | 'signal_loss' | 'user_action';
  timestamp: number;
  data: any;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private readonly MAX_EVENTS = 1000;

  track(type: AnalyticsEvent['type'], data: any = {}) {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    this.events.push(event);

    // Manter apenas os últimos MAX_EVENTS
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Salvar no localStorage periodicamente
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-100)));
    } catch (e) {
      console.warn('Erro ao salvar analytics');
    }
  }

  getStats() {
    const now = Date.now();
    const last24h = this.events.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000);
    
    return {
      total: this.events.length,
      last24h: last24h.length,
      signalsGenerated: this.events.filter(e => e.type === 'signal_generated').length,
      wins: this.events.filter(e => e.type === 'signal_win').length,
      losses: this.events.filter(e => e.type === 'signal_loss').length,
    };
  }

  clear() {
    this.events = [];
    localStorage.removeItem('analytics_events');
  }
}

export const analytics = new Analytics();
