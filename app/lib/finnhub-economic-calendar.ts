import { formatToWIB } from './time-utils';

export interface FinnhubEconomicEvent {
  actual: string;
  country: string;
  estimate: string;
  event: string;
  impact: string; // "1", "2", "3" (Low, Medium, High)
  prev: string;
  time: string; // "2025-01-15 13:30:00"
  unit: string;
}

export interface TransformedEconomicEvent {
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

class FinnhubEconomicCalendar {
  private readonly API_BASE_URL = 'https://finnhub.io/api/v1';
  private readonly apiKey: string;

  // Country code to full name mapping
  private readonly COUNTRY_MAPPING: Record<string, { name: string; currency: string }> = {
    'US': { name: 'United States', currency: 'USD' },
    'GB': { name: 'United Kingdom', currency: 'GBP' },
    'EU': { name: 'European Union', currency: 'EUR' },
    'DE': { name: 'Germany', currency: 'EUR' },
    'FR': { name: 'France', currency: 'EUR' },
    'JP': { name: 'Japan', currency: 'JPY' },
    'CA': { name: 'Canada', currency: 'CAD' },
    'AU': { name: 'Australia', currency: 'AUD' },
    'CH': { name: 'Switzerland', currency: 'CHF' },
    'CN': { name: 'China', currency: 'CNY' },
    'IT': { name: 'Italy', currency: 'EUR' },
    'ES': { name: 'Spain', currency: 'EUR' }
  };

  // Crypto-relevant event keywords
  private readonly CRYPTO_RELEVANT_EVENTS = [
    'Federal Fund', 'Interest Rate', 'CPI', 'Inflation', 'GDP', 'Employment',
    'Non-Farm Payrolls', 'NFP', 'FOMC', 'Fed', 'ECB', 'Bank of England',
    'PPI', 'PCE', 'Unemployment', 'Consumer Confidence', 'Retail Sales',
    'Manufacturing PMI', 'ISM', 'Monetary Policy', 'Central Bank'
  ];

  // Event category mapping
  private readonly EVENT_CATEGORIES: Record<string, string> = {
    'CPI': 'INFLATION',
    'Consumer Price Index': 'INFLATION',
    'PPI': 'INFLATION',
    'PCE': 'INFLATION',
    'Inflation': 'INFLATION',
    'Federal Fund': 'INTEREST_RATE',
    'Interest Rate': 'INTEREST_RATE',
    'FOMC': 'MONETARY_POLICY',
    'Fed': 'MONETARY_POLICY',
    'ECB': 'MONETARY_POLICY',
    'Non-Farm Payrolls': 'EMPLOYMENT',
    'NFP': 'EMPLOYMENT',
    'Unemployment': 'EMPLOYMENT',
    'Employment': 'EMPLOYMENT',
    'Jobless Claims': 'EMPLOYMENT',
    'GDP': 'GDP',
    'Gross Domestic Product': 'GDP',
    'Retail Sales': 'OTHER',
    'Consumer Confidence': 'OTHER',
    'PMI': 'OTHER',
    'ISM': 'OTHER',
    'Manufacturing': 'OTHER',
    'Trade': 'TRADE'
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Fetch economic calendar from Finnhub API
  async fetchEconomicCalendar(): Promise<FinnhubEconomicEvent[]> {
    try {
      console.log('📡 Fetching economic calendar from Finnhub API...');
      
      const url = `${this.API_BASE_URL}/calendar/economic?token=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Finnhub API rate limit exceeded (30 calls/second)');
        } else if (response.status === 401) {
          throw new Error('Invalid Finnhub API key');
        } else {
          throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (!data.economicCalendar) {
        console.warn('No economic calendar data returned from Finnhub');
        return [];
      }

      const events = data.economicCalendar as FinnhubEconomicEvent[];
      console.log(`✅ Fetched ${events.length} events from Finnhub`);
      
      return events;

    } catch (error) {
      console.error('❌ Failed to fetch Finnhub economic calendar:', error);
      throw error;
    }
  }

  // Transform Finnhub data to our internal format
  transformEvents(finnhubEvents: FinnhubEconomicEvent[]): TransformedEconomicEvent[] {
    console.log('🔄 Transforming Finnhub events to internal format...');
    
    const transformedEvents = finnhubEvents.map((event, index) => {
      // Parse date and convert to WIB
      const eventDateTime = new Date(event.time);
      const wibTime = formatToWIB(eventDateTime);
      
      // Get country info
      const countryInfo = this.COUNTRY_MAPPING[event.country] || {
        name: event.country,
        currency: 'USD'
      };

      // Determine impact level
      const impact = this.getImpactLevel(event.impact);
      
      // Determine category
      const category = this.getEventCategory(event.event);
      
      // Check crypto relevance
      const relevance = this.getCryptoRelevance(event.event);
      
      // Generate description
      const description = this.generateDescription(event.event, countryInfo.name);
      
      return {
        id: `finnhub-${eventDateTime.getTime()}-${index}`,
        title: event.event,
        description,
        date: wibTime.date.split(' ')[0], // Extract YYYY-MM-DD
        time: wibTime.time,
        country: countryInfo.name,
        currency: countryInfo.currency,
        impact,
        category,
        actual: event.actual || undefined,
        forecast: event.estimate || undefined,
        previous: event.prev || undefined,
        source: 'Finnhub',
        sourceUrl: 'https://finnhub.io',
        relevance
      };
    });

    console.log(`✅ Transformed ${transformedEvents.length} events`);
    return transformedEvents;
  }

  // Get events for specific date range
  async getEvents(daysAhead: number = 7): Promise<TransformedEconomicEvent[]> {
    try {
      // Fetch from Finnhub
      const finnhubEvents = await this.fetchEconomicCalendar();
      
      // Transform to our format
      const transformedEvents = this.transformEvents(finnhubEvents);
      
      // Filter by date range
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + daysAhead);
      
      const filteredEvents = transformedEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= endDate;
      });

      // Sort by date and time
      const sortedEvents = filteredEvents.sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
      });

      console.log(`📊 Filtered to ${sortedEvents.length} events for next ${daysAhead} days`);
      return sortedEvents;

    } catch (error) {
      console.error('❌ Failed to get Finnhub events:', error);
      throw error;
    }
  }

  // Get crypto-relevant events only
  async getCryptoRelevantEvents(daysAhead: number = 7): Promise<TransformedEconomicEvent[]> {
    const allEvents = await this.getEvents(daysAhead);
    return allEvents.filter(event => 
      event.relevance === 'CRYPTO' || event.relevance === 'ALL'
    );
  }

  // Get high impact events only
  async getHighImpactEvents(daysAhead: number = 7): Promise<TransformedEconomicEvent[]> {
    const allEvents = await this.getEvents(daysAhead);
    return allEvents.filter(event => event.impact === 'HIGH');
  }

  // Helper methods
  private getImpactLevel(finnhubImpact: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (finnhubImpact) {
      case '3':
        return 'HIGH';
      case '2':
        return 'MEDIUM';
      case '1':
      default:
        return 'LOW';
    }
  }

  private getEventCategory(eventName: string): string {
    for (const [keyword, category] of Object.entries(this.EVENT_CATEGORIES)) {
      if (eventName.toLowerCase().includes(keyword.toLowerCase())) {
        return category;
      }
    }
    return 'OTHER';
  }

  private getCryptoRelevance(eventName: string): 'CRYPTO' | 'FOREX' | 'STOCKS' | 'ALL' {
    const isCryptoRelevant = this.CRYPTO_RELEVANT_EVENTS.some(keyword =>
      eventName.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isCryptoRelevant) {
      // High impact events are specifically crypto relevant
      if (eventName.toLowerCase().includes('fed') || 
          eventName.toLowerCase().includes('fomc') ||
          eventName.toLowerCase().includes('interest rate') ||
          eventName.toLowerCase().includes('cpi')) {
        return 'CRYPTO';
      }
      return 'ALL';
    }
    
    return 'ALL';
  }

  private generateDescription(eventName: string, country: string): string {
    // Generate Indonesian descriptions based on event type
    const descriptions: Record<string, string> = {
      'CPI': `Indeks harga konsumen yang mengukur inflasi di ${country}`,
      'Consumer Price Index': `Indeks harga konsumen yang mengukur inflasi di ${country}`,
      'Non-Farm Payrolls': `Data ketenagakerjaan yang menunjukkan perubahan jumlah pekerja di ${country}`,
      'NFP': `Data ketenagakerjaan yang menunjukkan perubahan jumlah pekerja di ${country}`,
      'Federal Fund': `Keputusan suku bunga acuan Federal Reserve yang mempengaruhi pasar global`,
      'Interest Rate': `Keputusan tingkat suku bunga yang ditetapkan bank sentral ${country}`,
      'GDP': `Produk Domestik Bruto yang mengukur pertumbuhan ekonomi ${country}`,
      'Unemployment': `Tingkat pengangguran yang menunjukkan kondisi pasar tenaga kerja ${country}`,
      'FOMC': `Pertemuan komite kebijakan moneter Federal Reserve`,
      'Retail Sales': `Data penjualan ritel yang menggambarkan konsumsi masyarakat ${country}`,
      'PMI': `Indeks manajer pembelian yang mengukur aktivitas sektor manufaktur ${country}`,
      'Consumer Confidence': `Indeks kepercayaan konsumen terhadap kondisi ekonomi ${country}`
    };

    for (const [keyword, description] of Object.entries(descriptions)) {
      if (eventName.toLowerCase().includes(keyword.toLowerCase())) {
        return description;
      }
    }

    return `Event ekonomi penting dari ${country} yang dapat mempengaruhi pasar keuangan global`;
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.API_BASE_URL}/calendar/economic?token=${this.apiKey}`;
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get API usage stats (if available)
  async getAPIStats(): Promise<{ remaining?: number; reset?: number }> {
    try {
      const url = `${this.API_BASE_URL}/calendar/economic?token=${this.apiKey}`;
      const response = await fetch(url);
      
      return {
        remaining: response.headers.get('X-RateLimit-Remaining') ? 
          parseInt(response.headers.get('X-RateLimit-Remaining')!) : undefined,
        reset: response.headers.get('X-RateLimit-Reset') ? 
          parseInt(response.headers.get('X-RateLimit-Reset')!) : undefined
      };
    } catch {
      return {};
    }
  }
}

export const createFinnhubEconomicCalendar = (apiKey: string) => {
  return new FinnhubEconomicCalendar(apiKey);
};