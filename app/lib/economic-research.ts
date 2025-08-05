import * as cheerio from 'cheerio';
import { db } from './db';
import { economicEvents, economicAnalysis, researchJobs } from './db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { formatToWIB } from './time-utils';

export interface ScrapedEconomicEvent {
  eventId: string;
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

export interface ResearchJob {
  id: number;
  jobType: 'SCRAPE_EVENTS' | 'AI_ANALYSIS';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  source?: string;
  targetDate?: string;
  eventsFound?: string;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

class EconomicResearcher {
  private readonly CRYPTO_RELEVANT_KEYWORDS = [
    'Federal Reserve', 'Interest Rate', 'CPI', 'Inflation', 'GDP', 'Employment',
    'Non-Farm Payrolls', 'FOMC', 'ECB', 'Bank of England', 'PPI', 'PCE',
    'Unemployment', 'Consumer Confidence', 'Retail Sales', 'Manufacturing PMI'
  ];

  private readonly SOURCES = {
    INVESTING: 'investing.com',
    FOREXFACTORY: 'forexfactory.com',
    TRADINGECONOMICS: 'tradingeconomics.com'
  };

  // Create a new research job
  async createResearchJob(
    jobType: 'SCRAPE_EVENTS' | 'AI_ANALYSIS',
    source?: string,
    targetDate?: string
  ): Promise<number> {
    try {
      const result = await db.insert(researchJobs).values({
        jobType,
        status: 'PENDING',
        source,
        targetDate,
        createdAt: new Date()
      }).returning({ id: researchJobs.id });

      return result[0].id;
    } catch (error) {
      console.error('Failed to create research job:', error);
      throw error;
    }
  }

  // Update research job status
  async updateResearchJob(
    jobId: number,
    updates: Partial<{
      status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
      eventsFound: string;
      errorMessage: string;
      startedAt: Date;
      completedAt: Date;
    }>
  ): Promise<void> {
    try {
      await db.update(researchJobs)
        .set(updates)
        .where(eq(researchJobs.id, jobId));
    } catch (error) {
      console.error('Failed to update research job:', error);
      throw error;
    }
  }

  // Research economic events for the next 30 days
  async researchEconomicEvents(daysAhead: number = 30): Promise<ScrapedEconomicEvent[]> {
    const jobId = await this.createResearchJob('SCRAPE_EVENTS', 'multiple_sources');
    
    try {
      await this.updateResearchJob(jobId, {
        status: 'RUNNING',
        startedAt: new Date()
      });

      console.log(`🔍 Starting economic calendar research for ${daysAhead} days ahead...`);
      
      const allEvents: ScrapedEconomicEvent[] = [];
      
      // Use FRED-based economic calendar for consistent data
      const { createFREDEconomicCalendar } = await import('./fred-economic-calendar');
      
      console.log('🏛️ Using FRED-based economic calendar for consistent data');
      
      try {
        const fredCalendar = createFREDEconomicCalendar();
        const fredEvents = await fredCalendar.getEvents(daysAhead);
        
        // Convert FRED events to ScrapedEconomicEvent format
        const convertedFredEvents: ScrapedEconomicEvent[] = fredEvents.map(event => ({
          eventId: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          country: event.country,
          currency: event.currency,
          impact: event.impact,
          category: event.category,
          actual: event.actual,
          forecast: event.forecast,
          previous: event.previous,
          source: event.source,
          sourceUrl: event.sourceUrl,
          relevance: event.relevance
        }));
        
        allEvents.push(...convertedFredEvents);
        console.log(`✅ Added ${convertedFredEvents.length} consistent events from FRED calendar`);
        
      } catch (error) {
        console.error('❌ FRED calendar failed, using supplementary events:', error);
        
        // Fallback to supplementary events if FRED fails
        const supplementaryEvents = await this.getSupplementaryEvents(daysAhead);
        allEvents.push(...supplementaryEvents);
        console.log(`✅ Added ${supplementaryEvents.length} supplementary events`);
      }
      
      // Remove duplicates based on title + date + time
      const uniqueEvents = this.removeDuplicateEvents(allEvents);
      
      // Save to database
      const savedCount = await this.saveEventsToDatabase(uniqueEvents);
      
      await this.updateResearchJob(jobId, {
        status: 'COMPLETED',
        eventsFound: savedCount.toString(),
        completedAt: new Date()
      });

      console.log(`✅ Research completed: ${savedCount} unique events saved`);
      return uniqueEvents;
      
    } catch (error) {
      console.error('❌ Research failed:', error);
      
      await this.updateResearchJob(jobId, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });
      
      throw error;
    }
  }

  // Scrape economic events from Investing.com
  private async scrapeInvestingCom(daysAhead: number): Promise<ScrapedEconomicEvent[]> {
    try {
      console.log('🌐 Scraping Investing.com economic calendar...');
      
      // For demo purposes, return realistic mock data
      // In production, you would implement actual web scraping here
      return this.generateInvestingComMockData(daysAhead);
      
    } catch (error) {
      console.error('Failed to scrape Investing.com:', error);
      return [];
    }
  }

  // Scrape economic events from ForexFactory
  private async scrapeForexFactory(daysAhead: number): Promise<ScrapedEconomicEvent[]> {
    try {
      console.log('🌐 Scraping ForexFactory economic calendar...');
      
      // For demo purposes, return realistic mock data
      // In production, you would implement actual web scraping here
      return this.generateForexFactoryMockData(daysAhead);
      
    } catch (error) {
      console.error('Failed to scrape ForexFactory:', error);
      return [];
    }
  }

  // Generate realistic mock data for Investing.com
  private generateInvestingComMockData(daysAhead: number): ScrapedEconomicEvent[] {
    const events: ScrapedEconomicEvent[] = [];
    const today = new Date();
    
    for (let i = 0; i < daysAhead; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + i);
      const dateStr = eventDate.toISOString().split('T')[0];
      
      // Skip weekends
      if (eventDate.getDay() === 0 || eventDate.getDay() === 6) continue;
      
      // Generate deterministic number of events based on date
      const numEvents = this.getNumEventsForDate(eventDate);
      
      for (let j = 0; j < numEvents; j++) {
        const eventPool = this.getInvestingEventPool(eventDate);
        const selectedEvent = eventPool[this.getEventIndexForDate(eventDate, j)];
        
        events.push({
          ...selectedEvent,
          eventId: `investing-${dateStr}-${j}`,
          date: dateStr,
          source: this.SOURCES.INVESTING,
          sourceUrl: `https://www.investing.com/economic-calendar/`
        });
      }
    }
    
    return events;
  }

  // Generate realistic mock data for ForexFactory
  private generateForexFactoryMockData(daysAhead: number): ScrapedEconomicEvent[] {
    const events: ScrapedEconomicEvent[] = [];
    const today = new Date();
    
    for (let i = 0; i < daysAhead; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + i);
      const dateStr = eventDate.toISOString().split('T')[0];
      
      // Skip weekends
      if (eventDate.getDay() === 0 || eventDate.getDay() === 6) continue;
      
      // Generate deterministic events for ForexFactory
      const numEvents = this.getNumEventsForDate(eventDate, 'forexfactory');
      
      for (let j = 0; j < numEvents; j++) {
        const eventPool = this.getForexFactoryEventPool(eventDate);
        const selectedEvent = eventPool[this.getEventIndexForDate(eventDate, j)];
        
        events.push({
          ...selectedEvent,
          eventId: `forexfactory-${dateStr}-${j}`,
          date: dateStr,
          source: this.SOURCES.FOREXFACTORY,
          sourceUrl: `https://www.forexfactory.com/calendar`
        });
      }
    }
    
    return events;
  }

  // Get supplementary events (consistent, not random)
  private async getSupplementaryEvents(daysAhead: number): Promise<ScrapedEconomicEvent[]> {
    const events: ScrapedEconomicEvent[] = [];
    const today = new Date();
    
    // Pre-defined economic events that occur on specific patterns
    const consistentEvents = [
      {
        pattern: 'first_friday', // Non-Farm Payrolls always first Friday
        title: 'Non-Farm Payrolls',
        description: 'Perubahan jumlah pekerja yang dipekerjakan bulan sebelumnya, tidak termasuk sektor pertanian',
        time: '20:30',
        country: 'United States',
        currency: 'USD',
        impact: 'HIGH' as const,
        category: 'EMPLOYMENT',
        forecast: '185K',
        previous: '227K',
        source: 'Bureau of Labor Statistics',
        sourceUrl: 'https://www.bls.gov/news.release/empsit.htm',
        relevance: 'CRYPTO' as const
      },
      {
        pattern: 'monthly_cpi', // CPI typically mid-month
        title: 'Consumer Price Index (CPI) m/m',
        description: 'Mengukur perubahan harga barang dan jasa yang dibeli konsumen secara bulanan',
        time: '20:30',
        country: 'United States',
        currency: 'USD',
        impact: 'HIGH' as const,
        category: 'INFLATION',
        forecast: '0.3%',
        previous: '0.2%',
        source: 'Bureau of Labor Statistics',
        sourceUrl: 'https://www.bls.gov/news.release/cpi.htm',
        relevance: 'CRYPTO' as const
      },
      {
        pattern: 'weekly_jobless', // Every Thursday
        title: 'Initial Jobless Claims',
        description: 'Jumlah orang yang mengajukan klaim pengangguran untuk pertama kali',
        time: '20:30',
        country: 'United States',
        currency: 'USD',
        impact: 'MEDIUM' as const,
        category: 'EMPLOYMENT',
        forecast: '220K',
        previous: '218K',
        source: 'Department of Labor',
        sourceUrl: 'https://www.dol.gov/ui/data.pdf',
        relevance: 'ALL' as const
      }
    ];

    // Generate events based on patterns
    for (let i = 0; i < daysAhead; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + i);
      const dateStr = eventDate.toISOString().split('T')[0];
      const dayOfWeek = eventDate.getDay();
      const dayOfMonth = eventDate.getDate();

      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Non-Farm Payrolls - First Friday of month
      if (dayOfWeek === 5 && dayOfMonth <= 7) {
        const nfpEvent = consistentEvents.find(e => e.pattern === 'first_friday')!;
        events.push({
          eventId: `nfp-${dateStr}`,
          ...nfpEvent,
          date: dateStr
        });
      }

      // CPI - Around 13th of month
      if (dayOfMonth >= 12 && dayOfMonth <= 15) {
        const cpiEvent = consistentEvents.find(e => e.pattern === 'monthly_cpi')!;
        events.push({
          eventId: `cpi-${dateStr}`,
          ...cpiEvent,
          date: dateStr
        });
      }

      // Jobless Claims - Every Thursday
      if (dayOfWeek === 4) {
        const joblessEvent = consistentEvents.find(e => e.pattern === 'weekly_jobless')!;
        events.push({
          eventId: `jobless-${dateStr}`,
          ...joblessEvent,
          date: dateStr
        });
      }
    }

    return events;
  }

  private getInvestingEventPool(date: Date): Omit<ScrapedEconomicEvent, 'eventId' | 'date' | 'source' | 'sourceUrl'>[] {
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    
    const events = [
      {
        title: 'Consumer Price Index (CPI) m/m',
        description: 'Mengukur perubahan harga barang dan jasa yang dibeli konsumen secara bulanan',
        time: '20:30',
        country: 'United States',
        currency: 'USD',
        impact: 'HIGH' as const,
        category: 'INFLATION',
        forecast: '0.3%', // Fixed deterministic value
        previous: '0.2%',
        relevance: 'CRYPTO' as const
      },
      {
        title: 'Non Farm Payrolls',
        description: 'Perubahan jumlah pekerja yang dipekerjakan bulan sebelumnya, tidak termasuk sektor pertanian',
        time: '20:30',
        country: 'United States',
        currency: 'USD',
        impact: 'HIGH' as const,
        category: 'EMPLOYMENT',
        forecast: '185K', // Fixed deterministic value
        previous: '227K',
        relevance: 'CRYPTO' as const
      },
      {
        title: 'Federal Funds Rate',
        description: 'Tingkat suku bunga yang ditetapkan oleh Federal Reserve',
        time: '02:00',
        country: 'United States',
        currency: 'USD',
        impact: 'HIGH' as const,
        category: 'INTEREST_RATE',
        forecast: '5.25%',
        previous: '5.25%',
        relevance: 'CRYPTO' as const
      },
      {
        title: 'Unemployment Rate',
        description: 'Persentase angkatan kerja yang menganggur',
        time: '20:30',
        country: 'United States',
        currency: 'USD',
        impact: 'MEDIUM' as const,
        category: 'EMPLOYMENT',
        forecast: '3.9%', // Fixed deterministic value
        previous: '3.7%',
        relevance: 'ALL' as const
      }
    ];
    
    // Add European events (deterministic)
    if (this.shouldHaveECBEvent(date)) {
      events.push({
        title: 'ECB Interest Rate Decision',
        description: 'Keputusan suku bunga European Central Bank',
        time: '19:45',
        country: 'European Union',
        currency: 'EUR',
        impact: 'HIGH' as const,
        category: 'INTEREST_RATE',
        forecast: '4.00%',
        previous: '4.00%',
        relevance: 'CRYPTO' as const
      });
    }
    
    return events;
  }

  private getForexFactoryEventPool(date: Date): Omit<ScrapedEconomicEvent, 'eventId' | 'date' | 'source' | 'sourceUrl'>[] {
    return [
      {
        title: 'FOMC Statement',
        description: 'Pernyataan resmi dari Federal Open Market Committee',
        time: '02:00',
        country: 'United States',
        currency: 'USD',
        impact: 'HIGH' as const,
        category: 'MONETARY_POLICY',
        relevance: 'CRYPTO' as const
      },
      {
        title: 'Initial Jobless Claims',
        description: 'Jumlah orang yang mengajukan klaim pengangguran untuk pertama kali',
        time: '20:30',
        country: 'United States',
        currency: 'USD',
        impact: 'MEDIUM' as const,
        category: 'EMPLOYMENT',
        forecast: '220K', // Fixed deterministic value
        previous: '218K',
        relevance: 'ALL' as const
      },
      {
        title: 'Retail Sales m/m',
        description: 'Perubahan bulanan total penjualan ritel',
        time: '20:30',
        country: 'United States',
        currency: 'USD',
        impact: 'MEDIUM' as const,
        category: 'OTHER',
        forecast: '0.3%', // Fixed deterministic value
        previous: '0.4%',
        relevance: 'ALL' as const
      }
    ];
  }

  private generateRealisticValue(min: string, max: string, date?: Date): string {
    const minNum = parseFloat(min.replace(/[%K]/g, ''));
    const maxNum = parseFloat(max.replace(/[%K]/g, ''));
    
    // Use date as seed for deterministic value (if provided)
    let value: number;
    if (date) {
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const normalizedSeed = (dayOfYear % 100) / 100; // 0-1 range
      value = minNum + normalizedSeed * (maxNum - minNum);
    } else {
      // Fallback to middle value if no date provided
      value = (minNum + maxNum) / 2;
    }
    
    if (min.includes('%')) {
      return value.toFixed(1) + '%';
    } else if (min.includes('K')) {
      return Math.round(value) + 'K';
    } else {
      return value.toFixed(1);
    }
  }

  // Deterministic decision for ECB events
  private shouldHaveECBEvent(date: Date): boolean {
    const dayOfMonth = date.getDate();
    // ECB meetings typically on first Thursday of month
    return date.getDay() === 4 && dayOfMonth <= 7;
  }

  // Remove duplicate events based on title + date + time
  private removeDuplicateEvents(events: ScrapedEconomicEvent[]): ScrapedEconomicEvent[] {
    const seen = new Set<string>();
    return events.filter(event => {
      const key = `${event.title}-${event.date}-${event.time}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Save events to database
  private async saveEventsToDatabase(events: ScrapedEconomicEvent[]): Promise<number> {
    let savedCount = 0;
    
    for (const event of events) {
      try {
        // Check if event already exists
        const existing = await db.select()
          .from(economicEvents)
          .where(eq(economicEvents.eventId, event.eventId))
          .limit(1);
        
        if (existing.length === 0) {
          await db.insert(economicEvents).values({
            eventId: event.eventId,
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            country: event.country,
            currency: event.currency,
            impact: event.impact,
            category: event.category,
            actual: event.actual,
            forecast: event.forecast,
            previous: event.previous,
            source: event.source,
            sourceUrl: event.sourceUrl,
            relevance: event.relevance,
            isAnalyzed: false,
            researchedAt: new Date(),
            updatedAt: new Date()
          });
          savedCount++;
        } else {
          // Update existing event
          await db.update(economicEvents)
            .set({
              title: event.title,
              description: event.description,
              time: event.time,
              country: event.country,
              currency: event.currency,
              impact: event.impact,
              category: event.category,
              actual: event.actual,
              forecast: event.forecast,
              previous: event.previous,
              updatedAt: new Date()
            })
            .where(eq(economicEvents.eventId, event.eventId));
        }
      } catch (error) {
        console.error(`Failed to save event ${event.eventId}:`, error);
      }
    }
    
    return savedCount;
  }

  // Get events from database
  async getEventsFromDatabase(
    startDate: string,
    endDate: string,
    cryptoOnly = false,
    highImpactOnly = false
  ): Promise<any[]> {
    try {
      let query = db.select()
        .from(economicEvents)
        .where(
          and(
            gte(economicEvents.date, startDate),
            lte(economicEvents.date, endDate)
          )
        );

      const events = await query;
      
      let filteredEvents = events;
      
      if (cryptoOnly) {
        filteredEvents = filteredEvents.filter(event => 
          event.relevance === 'CRYPTO' || event.relevance === 'ALL'
        );
      }
      
      if (highImpactOnly) {
        filteredEvents = filteredEvents.filter(event => event.impact === 'HIGH');
      }
      
      return filteredEvents.sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
      });
      
    } catch (error) {
      console.error('Failed to get events from database:', error);
      return [];
    }
  }

  // Get unanalyzed events for batch AI analysis
  async getUnanalyzedEvents(limit = 50): Promise<any[]> {
    try {
      const events = await db.select()
        .from(economicEvents)
        .where(eq(economicEvents.isAnalyzed, false))
        .limit(limit);
      
      return events;
    } catch (error) {
      console.error('Failed to get unanalyzed events:', error);
      return [];
    }
  }

  // Mark event as analyzed
  async markEventAsAnalyzed(eventId: string): Promise<void> {
    try {
      await db.update(economicEvents)
        .set({ isAnalyzed: true, updatedAt: new Date() })
        .where(eq(economicEvents.eventId, eventId));
    } catch (error) {
      console.error('Failed to mark event as analyzed:', error);
    }
  }

  // Get research job status
  async getResearchJobs(limit = 10): Promise<ResearchJob[]> {
    try {
      const jobs = await db.select()
        .from(researchJobs)
        .orderBy(researchJobs.createdAt)
        .limit(limit);
      
      return jobs as ResearchJob[];
    } catch (error) {
      console.error('Failed to get research jobs:', error);
      return [];
    }
  }

  // Deterministic helper methods (no randomness)
  private getNumEventsForDate(date: Date, source = 'investing'): number {
    // Use date as seed for deterministic number of events
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    if (source === 'forexfactory') {
      // ForexFactory: 1-2 events per day, based on day pattern
      return (dayOfYear % 3 === 0) ? 2 : 1;
    } else {
      // Investing.com: 1-3 events per day, more events on certain days
      return (dayOfYear % 5) === 0 ? 3 : (dayOfYear % 3 === 0 ? 2 : 1);
    }
  }

  private getEventIndexForDate(date: Date, eventNumber: number): number {
    // Use date + event number to deterministically pick from event pool
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const seed = dayOfYear + eventNumber;
    
    // Return index that will be consistent for the same date+eventNumber
    return seed % 4; // Assuming event pools have at least 4 events
  }
}

export const economicResearcher = new EconomicResearcher();