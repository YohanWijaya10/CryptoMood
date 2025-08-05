export interface EconomicEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  country: string;
  currency: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'INTEREST_RATE' | 'INFLATION' | 'EMPLOYMENT' | 'GDP' | 'TRADE' | 'MONETARY_POLICY' | 'OTHER';
  actual?: string;
  forecast?: string;
  previous?: string;
  source: string;
  relevance: 'CRYPTO' | 'FOREX' | 'STOCKS' | 'COMMODITIES' | 'ALL';
}

export interface EconomicCalendarData {
  events: EconomicEvent[];
  lastUpdated: string;
  totalEvents: number;
}

class EconomicCalendarParser {
  private readonly CRYPTO_RELEVANT_EVENTS = [
    'Federal Reserve',
    'Interest Rate',
    'CPI',
    'Inflation',
    'GDP',
    'Employment',
    'Non-Farm Payrolls',
    'FOMC',
    'ECB',
    'Bank of England',
    'PPI',
    'PCE',
    'Unemployment',
    'Consumer Confidence'
  ];

  private generateRealisticEvents(): EconomicEvent[] {
    const today = new Date();
    const events: EconomicEvent[] = [];
    
    // Generate events for the next 14 days
    for (let i = 0; i < 14; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + i);
      
      const dailyEvents = this.getRealisticDailyEvents(eventDate);
      events.push(...dailyEvents);
    }
    
    return events.sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
  }

  private getRealisticDailyEvents(date: Date): EconomicEvent[] {
    const events: EconomicEvent[] = [];
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    const dayOfMonth = date.getDate();
    const month = date.getMonth();
    
    // Skip weekends for most events
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return events;
    }

    // Generate more realistic and varied events based on actual economic calendar patterns
    const eventPool = this.getEventPool(dateStr, dayOfWeek, dayOfMonth, month, date);
    
    // Deterministically select events based on date
    const numEvents = this.getDeterministicEventCount(date);
    const selectedEvents = this.selectDeterministicEvents(eventPool, date, numEvents);
    
    events.push(...selectedEvents);
    return events;
  }

  private getEventPool(dateStr: string, dayOfWeek: number, dayOfMonth: number, month: number, date: Date): EconomicEvent[] {
    const pool: EconomicEvent[] = [];
    
    // US Events - Most impactful for crypto
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // CPI - Usually first half of month
      if (dayOfMonth <= 15) {
        pool.push({
          id: `cpi-${dateStr}`,
          title: 'Consumer Price Index (CPI)',
          description: 'Mengukur perubahan harga barang dan jasa yang dibeli konsumen',
          date: dateStr,
          time: '20:30', // 8:30 AM EST = 8:30 PM WIB
          country: 'United States',
          currency: 'USD',
          impact: 'HIGH',
          category: 'INFLATION',
          forecast: this.getDeterministicValue('2.3%', '2.6%', date),
          previous: this.getDeterministicValue('2.4%', '2.8%', date),
          source: 'Bureau of Labor Statistics',
          relevance: 'CRYPTO'
        });
      }

      // Non-Farm Payrolls - First Friday of month
      if (dayOfWeek === 5 && dayOfMonth <= 7) {
        pool.push({
          id: `nfp-${dateStr}`,
          title: 'Non-Farm Payrolls',
          description: 'Perubahan jumlah pekerja yang dipekerjakan bulan sebelumnya',
          date: dateStr,
          time: '20:30',
          country: 'United States',
          currency: 'USD',
          impact: 'HIGH',
          category: 'EMPLOYMENT',
          forecast: this.getDeterministicValue('180K', '220K', date),
          previous: this.getDeterministicValue('150K', '200K', date),
          source: 'Bureau of Labor Statistics',
          relevance: 'CRYPTO'
        });
      }

      // Initial Jobless Claims - Every Thursday
      if (dayOfWeek === 4) {
        pool.push({
          id: `jobless-${dateStr}`,
          title: 'Initial Jobless Claims',
          description: 'Jumlah orang yang mengajukan tunjangan pengangguran untuk pertama kali',
          date: dateStr,
          time: '20:30',
          country: 'United States',
          currency: 'USD',
          impact: 'MEDIUM',
          category: 'EMPLOYMENT',
          forecast: this.getDeterministicValue('210K', '230K', date),
          previous: this.getDeterministicValue('205K', '225K', date),
          source: 'Department of Labor',
          relevance: 'ALL'
        });
      }

      // FOMC Events - Irregular but high impact (deterministic based on date)
      if (this.shouldHaveFOMCEvent(date)) {
        pool.push({
          id: `fomc-${dateStr}`,
          title: 'FOMC Meeting Minutes',
          description: 'Risalah rapat Federal Open Market Committee',
          date: dateStr,
          time: '02:00', // 2:00 PM EST = 2:00 AM WIB next day
          country: 'United States',
          currency: 'USD',
          impact: 'HIGH',
          category: 'MONETARY_POLICY',
          source: 'Federal Reserve',
          relevance: 'CRYPTO'
        });
      }

      // Fed Interest Rate Decision (deterministic based on date)
      if (this.shouldHaveFedRateEvent(date)) {
        pool.push({
          id: `fed-rate-${dateStr}`,
          title: 'Federal Fund Rate Decision',
          description: 'Keputusan suku bunga acuan Federal Reserve',
          date: dateStr,
          time: '02:00',
          country: 'United States',
          currency: 'USD',
          impact: 'HIGH',
          category: 'INTEREST_RATE',
          forecast: '5.25%',
          previous: '5.25%',
          source: 'Federal Reserve',
          relevance: 'CRYPTO'
        });
      }

      // Manufacturing PMI - First business day of month
      if (dayOfMonth <= 3) {
        pool.push({
          id: `pmi-${dateStr}`,
          title: 'Manufacturing PMI',
          description: 'Indeks Manajer Pembelian sektor manufaktur',
          date: dateStr,
          time: '21:00',
          country: 'United States',
          currency: 'USD',
          impact: 'MEDIUM',
          category: 'OTHER',
          forecast: this.getDeterministicValue('51.5', '52.8', date),
          previous: this.getDeterministicValue('50.9', '52.2', date),
          source: 'ISM',
          relevance: 'ALL'
        });
      }

      // GDP - Quarterly
      if (dayOfMonth <= 10 && [2, 5, 8, 11].includes(month)) {
        pool.push({
          id: `gdp-${dateStr}`,
          title: 'GDP Growth Rate (QoQ)',
          description: 'Tingkat pertumbuhan Produk Domestik Bruto kuartalan',
          date: dateStr,
          time: '20:30',
          country: 'United States',
          currency: 'USD',
          impact: 'HIGH',
          category: 'GDP',
          forecast: this.getDeterministicValue('2.0%', '2.5%', date),
          previous: this.getDeterministicValue('1.8%', '2.8%', date),
          source: 'Bureau of Economic Analysis',
          relevance: 'CRYPTO'
        });
      }
    }

    // European Events (deterministic based on date)
    if (this.shouldHaveECBEvent(date)) {
      pool.push({
        id: `ecb-rate-${dateStr}`,
        title: 'ECB Interest Rate Decision',
        description: 'Keputusan suku bunga European Central Bank',
        date: dateStr,
        time: '19:45',
        country: 'European Union',
        currency: 'EUR',
        impact: 'HIGH',
        category: 'INTEREST_RATE',
        forecast: '4.00%',
        previous: '4.00%',
        source: 'European Central Bank',
        relevance: 'CRYPTO'
      });
    }

    // UK Events (deterministic based on date)
    if (this.shouldHaveBOEEvent(date)) {
      pool.push({
        id: `boe-rate-${dateStr}`,
        title: 'BoE Interest Rate Decision',
        description: 'Keputusan suku bunga Bank of England',
        date: dateStr,
        time: '19:00',
        country: 'United Kingdom',
        currency: 'GBP',
        impact: 'HIGH',
        category: 'INTEREST_RATE',
        forecast: '5.25%',
        previous: '5.25%',
        source: 'Bank of England',
        relevance: 'CRYPTO'
      });
    }

    // Consumer Confidence
    if (dayOfMonth >= 25) {
      pool.push({
        id: `consumer-confidence-${dateStr}`,
        title: 'Consumer Confidence Index',
        description: 'Indeks kepercayaan konsumen terhadap kondisi ekonomi',
        date: dateStr,
        time: '22:00',
        country: 'United States',
        currency: 'USD',
        impact: 'MEDIUM',
        category: 'OTHER',
        forecast: this.getDeterministicValue('102.5', '108.2', date),
        previous: this.getDeterministicValue('100.8', '106.9', date),
        source: 'Conference Board',
        relevance: 'ALL'
      });
    }

    // Retail Sales
    if (dayOfMonth >= 10 && dayOfMonth <= 20) {
      pool.push({
        id: `retail-sales-${dateStr}`,
        title: 'Retail Sales (MoM)',
        description: 'Perubahan bulanan penjualan ritel',
        date: dateStr,
        time: '20:30',
        country: 'United States',
        currency: 'USD',
        impact: 'MEDIUM',
        category: 'OTHER',
        forecast: this.getDeterministicValue('0.2%', '0.5%', date),
        previous: this.getDeterministicValue('0.1%', '0.8%', date),
        source: 'Census Bureau',
        relevance: 'ALL'
      });
    }

    return pool;
  }


  // Deterministic helper methods (no randomness)
  private getDeterministicEventCount(date: Date): number {
    // Use date as seed for deterministic number of events (1-3)
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return (dayOfYear % 3) + 1; // 1, 2, or 3 events
  }

  private selectDeterministicEvents<T>(array: T[], date: Date, count: number): T[] {
    if (array.length === 0) return [];
    
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const selected: T[] = [];
    
    for (let i = 0; i < Math.min(count, array.length); i++) {
      const index = (dayOfYear + i) % array.length;
      selected.push(array[index]);
    }
    
    return selected;
  }

  private getDeterministicValue(min: string, max: string, date?: Date): string {
    const minNum = parseFloat(min.replace(/[%K]/g, ''));
    const maxNum = parseFloat(max.replace(/[%K]/g, ''));
    
    let value: number;
    if (date) {
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const normalizedSeed = (dayOfYear % 100) / 100; // 0-1 range
      value = minNum + normalizedSeed * (maxNum - minNum);
    } else {
      value = (minNum + maxNum) / 2; // Middle value
    }
    
    if (min.includes('%')) {
      return value.toFixed(1) + '%';
    } else if (min.includes('K')) {
      return Math.round(value) + 'K';
    } else {
      return value.toFixed(1);
    }
  }

  // Deterministic decision methods (no randomness)
  private shouldHaveFOMCEvent(date: Date): boolean {
    const dayOfMonth = date.getDate();
    // FOMC events typically occur during specific meeting dates
    return dayOfMonth >= 28 || dayOfMonth <= 2; // End/beginning of month
  }

  private shouldHaveFedRateEvent(date: Date): boolean {
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();
    // Fed rate decisions typically on specific meeting days
    return dayOfWeek === 3 && dayOfMonth >= 26; // Wednesday, end of month
  }

  private shouldHaveECBEvent(date: Date): boolean {
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();
    // ECB meetings typically first Thursday of month
    return dayOfWeek === 4 && dayOfMonth <= 7;
  }

  private shouldHaveBOEEvent(date: Date): boolean {
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();
    // BOE meetings typically first Thursday of month (different weeks than ECB)
    return dayOfWeek === 4 && dayOfMonth >= 8 && dayOfMonth <= 14;
  }

  private getCryptoRelevantEvents(events: EconomicEvent[]): EconomicEvent[] {
    return events.filter(event => 
      event.relevance === 'CRYPTO' || 
      event.relevance === 'ALL' ||
      this.CRYPTO_RELEVANT_EVENTS.some(keyword => 
        event.title.includes(keyword) || event.description.includes(keyword)
      )
    );
  }

  async fetchEconomicEvents(
    filterByCrypto: boolean = false,
    daysAhead: number = 7
  ): Promise<EconomicCalendarData> {
    try {
      // Currently using realistic mock data that simulates real economic calendar patterns
      // Future implementation could integrate with:
      // - Finnhub Economic Calendar API (requires premium plan)
      // - Alpha Vantage Economic Indicators
      // - Federal Reserve Economic Data (FRED)
      // - Trading Economics API
      
      console.log('Loading realistic economic calendar events...');
      
      let events = this.generateRealisticEvents();
      
      // Filter events within the specified days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
      
      events = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate <= cutoffDate;
      });
      
      // Filter by crypto relevance if requested
      if (filterByCrypto) {
        events = this.getCryptoRelevantEvents(events);
      }

      console.log(`✅ Fetched ${events.length} economic events`);
      
      return {
        events,
        lastUpdated: new Date().toISOString(),
        totalEvents: events.length
      };
      
    } catch (error) {
      console.error('Error fetching economic events:', error);
      
      // Return minimal fallback data
      return {
        events: [{
          id: 'fallback-1',
          title: 'Federal Reserve Interest Rate Decision',
          description: 'The Federal Reserve announces its decision on interest rates',
          date: new Date().toISOString().split('T')[0],
          time: '19:00',
          country: 'United States',
          currency: 'USD',
          impact: 'HIGH',
          category: 'INTEREST_RATE',
          source: 'Federal Reserve',
          relevance: 'CRYPTO'
        }],
        lastUpdated: new Date().toISOString(),
        totalEvents: 1
      };
    }
  }

  // Get events for a specific date
  async getEventsByDate(date: string, filterByCrypto: boolean = false): Promise<EconomicEvent[]> {
    const data = await this.fetchEconomicEvents(filterByCrypto, 30);
    return data.events.filter(event => event.date === date);
  }

  // Get high impact events only
  async getHighImpactEvents(daysAhead: number = 7): Promise<EconomicEvent[]> {
    const data = await this.fetchEconomicEvents(false, daysAhead);
    return data.events.filter(event => event.impact === 'HIGH');
  }

  // Get crypto-relevant events
  async getCryptoRelevantEventsOnly(daysAhead: number = 7): Promise<EconomicEvent[]> {
    const data = await this.fetchEconomicEvents(true, daysAhead);
    return data.events;
  }
}

export const economicCalendarParser = new EconomicCalendarParser();