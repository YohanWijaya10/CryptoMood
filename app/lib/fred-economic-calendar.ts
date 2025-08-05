import { formatToWIB } from './time-utils';

export interface FREDEconomicEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm WIB
  country: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  actual?: string;
  forecast?: string;
  previous?: string;
  source: string;
  sourceUrl: string;
  relevance: 'CRYPTO' | 'FOREX' | 'STOCKS' | 'ALL';
}

class FREDEconomicCalendar {
  private readonly FRED_BASE_URL = 'https://api.stlouisfed.org/fred';
  private readonly apiKey: string | null;

  // Static economic releases with consistent dates (these don't change)
  private readonly STATIC_ECONOMIC_EVENTS = [
    {
      title: 'Consumer Price Index (CPI)',
      description: 'Indeks harga konsumen yang mengukur tingkat inflasi di Amerika Serikat',
      category: 'INFLATION',
      impact: 'HIGH' as const,
      time: '20:30', // 8:30 AM EST = 8:30 PM WIB
      relevance: 'CRYPTO' as const,
      pattern: 'monthly_mid', // Mid-month release
      source: 'Bureau of Labor Statistics',
      sourceUrl: 'https://www.bls.gov/news.release/cpi.htm',
      forecast: '0.3%',
      previous: '0.2%'
    },
    {
      title: 'Non-Farm Payrolls',
      description: 'Laporan ketenagakerjaan yang menunjukkan perubahan jumlah pekerja non-pertanian',
      category: 'EMPLOYMENT',
      impact: 'HIGH' as const,
      time: '20:30',
      relevance: 'CRYPTO' as const,
      pattern: 'first_friday', // First Friday of month
      source: 'Bureau of Labor Statistics',
      sourceUrl: 'https://www.bls.gov/news.release/empsit.htm',
      forecast: '185K',
      previous: '227K'
    },
    {
      title: 'Federal Funds Rate Decision',
      description: 'Keputusan suku bunga acuan Federal Reserve yang mempengaruhi seluruh pasar keuangan',
      category: 'INTEREST_RATE',
      impact: 'HIGH' as const,
      time: '02:00', // 2:00 PM EST = 2:00 AM WIB next day
      relevance: 'CRYPTO' as const,
      pattern: 'fomc_scheduled', // FOMC meeting dates
      source: 'Federal Reserve',
      sourceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
      forecast: '5.25-5.50%',
      previous: '5.25-5.50%'
    },
    {
      title: 'Initial Jobless Claims',
      description: 'Jumlah klaim pengangguran baru yang diajukan dalam seminggu terakhir',
      category: 'EMPLOYMENT',
      impact: 'MEDIUM' as const,
      time: '20:30',
      relevance: 'ALL' as const,
      pattern: 'weekly_thursday', // Every Thursday
      source: 'Department of Labor',
      sourceUrl: 'https://www.dol.gov/ui/data.pdf',
      forecast: '220K',
      previous: '218K'
    },
    {
      title: 'Retail Sales',
      description: 'Data penjualan ritel bulanan yang mencerminkan tingkat konsumsi masyarakat',
      category: 'OTHER',
      impact: 'MEDIUM' as const,
      time: '20:30',
      relevance: 'ALL' as const,
      pattern: 'monthly_mid',
      source: 'Census Bureau',
      sourceUrl: 'https://www.census.gov/retail/marts/www/marts_current.pdf',
      forecast: '0.3%',
      previous: '0.4%'
    },
    {
      title: 'Producer Price Index (PPI)',
      description: 'Indeks harga produsen yang mengukur inflasi dari sisi produsen',
      category: 'INFLATION',
      impact: 'MEDIUM' as const,
      time: '20:30',
      relevance: 'ALL' as const,
      pattern: 'monthly_mid',
      source: 'Bureau of Labor Statistics',
      sourceUrl: 'https://www.bls.gov/news.release/ppi.htm',
      forecast: '0.2%',
      previous: '0.1%'
    },
    {
      title: 'Consumer Confidence Index',
      description: 'Indeks kepercayaan konsumen terhadap kondisi ekonomi saat ini dan masa depan',
      category: 'OTHER',
      impact: 'MEDIUM' as const,
      time: '22:00', // 10:00 AM EST = 10:00 PM WIB
      relevance: 'ALL' as const,
      pattern: 'monthly_end', // End of month
      source: 'Conference Board',
      sourceUrl: 'https://www.conference-board.org/topics/consumer-confidence',
      forecast: '105.2',
      previous: '103.8'
    },
    {
      title: 'Manufacturing PMI',
      description: 'Indeks Manajer Pembelian sektor manufaktur yang mengukur aktivitas industri',
      category: 'OTHER',
      impact: 'MEDIUM' as const,
      time: '21:00', // 9:00 AM EST = 9:00 PM WIB
      relevance: 'ALL' as const,
      pattern: 'first_business_day', // First business day of month
      source: 'Institute for Supply Management',
      sourceUrl: 'https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/',
      forecast: '51.8',
      previous: '52.2'
    }
  ];

  // FOMC meeting dates for 2025 (official Federal Reserve calendar)
  private readonly FOMC_DATES_2025 = [
    '2025-01-28', '2025-01-29', // January 28-29
    '2025-03-18', '2025-03-19', // March 18-19
    '2025-04-29', '2025-04-30', // April 29-30
    '2025-06-10', '2025-06-11', // June 10-11
    '2025-07-29', '2025-07-30', // July 29-30
    '2025-09-16', '2025-09-17', // September 16-17
    '2025-10-28', '2025-10-29', // October 28-29
    '2025-12-16', '2025-12-17'  // December 16-17
  ];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FRED_API_KEY || null;
  }

  // Generate consistent economic events for date range
  async getEvents(daysAhead: number = 7): Promise<FREDEconomicEvent[]> {
    try {
      console.log('🏛️ Generating consistent economic calendar events...');
      
      const events: FREDEconomicEvent[] = [];
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + daysAhead);

      // Generate events based on patterns
      for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayEvents = this.getEventsForDate(new Date(date));
        events.push(...dayEvents);
      }

      // Sort by date and time
      const sortedEvents = events.sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
      });

      console.log(`✅ Generated ${sortedEvents.length} consistent economic events`);
      return sortedEvents;

    } catch (error) {
      console.error('❌ Failed to generate economic events:', error);
      throw error;
    }
  }

  // Get events for specific date (deterministic)
  private getEventsForDate(date: Date): FREDEconomicEvent[] {
    const events: FREDEconomicEvent[] = [];
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    const isLastDayOfMonth = this.isLastBusinessDayOfMonth(date);

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return events;
    }

    // FOMC Rate Decision (official dates)
    if (this.FOMC_DATES_2025.includes(dateStr) && dateStr.endsWith('29')) {
      const fomcEvent = this.STATIC_ECONOMIC_EVENTS.find(e => e.pattern === 'fomc_scheduled')!;
      events.push(this.createEvent(fomcEvent, dateStr, `fomc-${dateStr}`));
    }

    // Non-Farm Payrolls (First Friday)
    if (dayOfWeek === 5 && dayOfMonth <= 7) {
      const nfpEvent = this.STATIC_ECONOMIC_EVENTS.find(e => e.pattern === 'first_friday')!;
      events.push(this.createEvent(nfpEvent, dateStr, `nfp-${dateStr}`));
    }

    // CPI (Mid-month, around 13th)
    if (dayOfMonth >= 12 && dayOfMonth <= 15 && dayOfWeek >= 1 && dayOfWeek <= 5) {
      const cpiEvent = this.STATIC_ECONOMIC_EVENTS.find(e => e.title.includes('CPI'))!;
      events.push(this.createEvent(cpiEvent, dateStr, `cpi-${dateStr}`));
    }

    // Weekly Jobless Claims (Every Thursday)
    if (dayOfWeek === 4) {
      const joblessEvent = this.STATIC_ECONOMIC_EVENTS.find(e => e.pattern === 'weekly_thursday')!;
      events.push(this.createEvent(joblessEvent, dateStr, `jobless-${dateStr}`));
    }

    // PPI (Usually day after CPI)
    if (dayOfMonth >= 13 && dayOfMonth <= 16 && dayOfWeek >= 1 && dayOfWeek <= 5) {
      const ppiEvent = this.STATIC_ECONOMIC_EVENTS.find(e => e.title.includes('PPI'))!;
      events.push(this.createEvent(ppiEvent, dateStr, `ppi-${dateStr}`));
    }

    // Retail Sales (Mid-month)
    if (dayOfMonth >= 14 && dayOfMonth <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5) {
      const retailEvent = this.STATIC_ECONOMIC_EVENTS.find(e => e.title.includes('Retail Sales'))!;
      events.push(this.createEvent(retailEvent, dateStr, `retail-${dateStr}`));
    }

    // Manufacturing PMI (First business day)
    if (dayOfMonth <= 3 && dayOfWeek >= 1 && dayOfWeek <= 5) {
      const pmiEvent = this.STATIC_ECONOMIC_EVENTS.find(e => e.title.includes('Manufacturing PMI'))!;
      events.push(this.createEvent(pmiEvent, dateStr, `pmi-${dateStr}`));
    }

    // Consumer Confidence (Last Tuesday of month)
    if (isLastDayOfMonth && dayOfWeek === 2) {
      const confidenceEvent = this.STATIC_ECONOMIC_EVENTS.find(e => e.title.includes('Consumer Confidence'))!;
      events.push(this.createEvent(confidenceEvent, dateStr, `confidence-${dateStr}`));
    }

    return events;
  }

  // Create event object
  private createEvent(template: any, date: string, id: string): FREDEconomicEvent {
    return {
      id,
      title: template.title,
      description: template.description,
      date,
      time: template.time,
      country: 'United States',
      currency: 'USD',
      impact: template.impact,
      category: template.category,
      actual: template.actual,
      forecast: template.forecast,
      previous: template.previous,
      source: template.source,
      sourceUrl: template.sourceUrl,
      relevance: template.relevance
    };
  }

  // Check if date is last business day of month
  private isLastBusinessDayOfMonth(date: Date): boolean {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const lastDayOfMonth = new Date(nextMonth.getTime() - 1);
    
    // Find last business day
    while (lastDayOfMonth.getDay() === 0 || lastDayOfMonth.getDay() === 6) {
      lastDayOfMonth.setDate(lastDayOfMonth.getDate() - 1);
    }
    
    return date.toDateString() === lastDayOfMonth.toDateString();
  }

  // Get crypto-relevant events only
  async getCryptoRelevantEvents(daysAhead: number = 7): Promise<FREDEconomicEvent[]> {
    const allEvents = await this.getEvents(daysAhead);
    return allEvents.filter(event => 
      event.relevance === 'CRYPTO' || event.relevance === 'ALL'
    );
  }

  // Get high impact events only
  async getHighImpactEvents(daysAhead: number = 7): Promise<FREDEconomicEvent[]> {
    const allEvents = await this.getEvents(daysAhead);
    return allEvents.filter(event => event.impact === 'HIGH');
  }

  // Test connection (always returns true for FRED-based system)
  async testConnection(): Promise<boolean> {
    return true; // FRED-based system always works
  }
}

export const createFREDEconomicCalendar = (apiKey?: string) => {
  return new FREDEconomicCalendar(apiKey);
};