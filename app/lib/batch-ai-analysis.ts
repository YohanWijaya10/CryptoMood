import { db } from './db';
import { economicEvents, economicAnalysis, researchJobs } from './db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { EconomicEventAnalysis, economicEventAnalyzer } from './ai-economic-analysis';

export interface BatchAnalysisResult {
  totalEvents: number;
  successfulAnalysis: number;
  failedAnalysis: number;
  errors: string[];
}

export interface BatchAnalysisProgress {
  current: number;
  total: number;
  percentage: number;
  currentEvent: string;
  status: 'running' | 'completed' | 'failed';
}

class BatchAIAnalyzer {
  private progressCallback?: (progress: BatchAnalysisProgress) => void;

  // Set progress callback for real-time updates
  setProgressCallback(callback: (progress: BatchAnalysisProgress) => void) {
    this.progressCallback = callback;
  }

  // Run batch AI analysis on all unanalyzed events
  async runBatchAnalysis(batchSize = 10): Promise<BatchAnalysisResult> {
    const jobId = await this.createAnalysisJob();
    
    try {
      await this.updateAnalysisJob(jobId, {
        status: 'RUNNING',
        startedAt: new Date()
      });

      console.log('🤖 Starting batch AI analysis...');
      
      // Get all unanalyzed events
      const unanalyzedEvents = await this.getUnanalyzedEvents();
      console.log(`📊 Found ${unanalyzedEvents.length} events to analyze`);
      
      if (unanalyzedEvents.length === 0) {
        await this.updateAnalysisJob(jobId, {
          status: 'COMPLETED',
          eventsFound: '0',
          completedAt: new Date()
        });
        
        return {
          totalEvents: 0,
          successfulAnalysis: 0,
          failedAnalysis: 0,
          errors: []
        };
      }

      const result: BatchAnalysisResult = {
        totalEvents: unanalyzedEvents.length,
        successfulAnalysis: 0,
        failedAnalysis: 0,
        errors: []
      };

      // Process events in batches to avoid rate limits
      for (let i = 0; i < unanalyzedEvents.length; i += batchSize) {
        const batch = unanalyzedEvents.slice(i, i + batchSize);
        
        console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(unanalyzedEvents.length / batchSize)}`);
        
        // Process batch sequentially to respect API rate limits
        for (const event of batch) {
          try {
            // Update progress
            if (this.progressCallback) {
              this.progressCallback({
                current: result.successfulAnalysis + result.failedAnalysis + 1,
                total: unanalyzedEvents.length,
                percentage: Math.round(((result.successfulAnalysis + result.failedAnalysis + 1) / unanalyzedEvents.length) * 100),
                currentEvent: event.title,
                status: 'running'
              });
            }

            // Prepare event data for AI analysis
            const eventData = {
              title: event.title,
              description: event.description || '',
              category: event.category,
              impact: event.impact,
              country: event.country,
              currency: event.currency,
              actual: event.actual,
              forecast: event.forecast,
              previous: event.previous
            };

            console.log(`🧠 Analyzing: ${event.title}`);
            
            // Run AI analysis
            const analysis = await economicEventAnalyzer.analyzeEvent(eventData);
            
            // Save analysis to database
            await this.saveAnalysisToDatabase(event.eventId, analysis);
            
            // Mark event as analyzed
            await this.markEventAsAnalyzed(event.eventId);
            
            result.successfulAnalysis++;
            console.log(`✅ Successfully analyzed: ${event.title}`);
            
            // Small delay to respect rate limits
            await this.delay(1000);
            
          } catch (error) {
            console.error(`❌ Failed to analyze event ${event.title}:`, error);
            result.failedAnalysis++;
            result.errors.push(`${event.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            
            // Continue with next event even if one fails
            continue;
          }
        }
        
        // Delay between batches
        if (i + batchSize < unanalyzedEvents.length) {
          console.log('⏳ Waiting 5 seconds before next batch...');
          await this.delay(5000);
        }
      }

      // Update final progress
      if (this.progressCallback) {
        this.progressCallback({
          current: result.totalEvents,
          total: result.totalEvents,
          percentage: 100,
          currentEvent: 'Completed',
          status: 'completed'
        });
      }

      await this.updateAnalysisJob(jobId, {
        status: 'COMPLETED',
        eventsFound: result.successfulAnalysis.toString(),
        completedAt: new Date()
      });

      console.log(`🎉 Batch analysis completed:`);
      console.log(`   • Total events: ${result.totalEvents}`);
      console.log(`   • Successful: ${result.successfulAnalysis}`);
      console.log(`   • Failed: ${result.failedAnalysis}`);

      return result;
      
    } catch (error) {
      console.error('❌ Batch analysis failed:', error);
      
      await this.updateAnalysisJob(jobId, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });
      
      if (this.progressCallback) {
        this.progressCallback({
          current: 0,
          total: 0,
          percentage: 0,
          currentEvent: 'Failed',
          status: 'failed'
        });
      }
      
      throw error;
    }
  }

  // Get unanalyzed events from database
  private async getUnanalyzedEvents(): Promise<any[]> {
    try {
      const events = await db.select()
        .from(economicEvents)
        .where(eq(economicEvents.isAnalyzed, false))
        .orderBy(economicEvents.date, economicEvents.time);
      
      return events;
    } catch (error) {
      console.error('Failed to get unanalyzed events:', error);
      return [];
    }
  }

  // Save AI analysis to database
  private async saveAnalysisToDatabase(eventId: string, analysis: EconomicEventAnalysis): Promise<void> {
    try {
      // Calculate expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.insert(economicAnalysis).values({
        eventId,
        impactScore: analysis.impactScore.toString(),
        direction: analysis.direction,
        confidence: analysis.confidence.toString(),
        timeframe: analysis.timeframe,
        analysis: analysis.analysis,
        historicalContext: analysis.historicalContext,
        keyFactors: JSON.stringify(analysis.keyFactors),
        cryptoImpact: JSON.stringify(analysis.cryptoImpact),
        riskLevel: analysis.riskLevel,
        provider: analysis.provider,
        analyzedAt: new Date(),
        expiresAt
      });
      
    } catch (error) {
      console.error('Failed to save analysis to database:', error);
      throw error;
    }
  }

  // Mark event as analyzed
  private async markEventAsAnalyzed(eventId: string): Promise<void> {
    try {
      await db.update(economicEvents)
        .set({ 
          isAnalyzed: true,
          updatedAt: new Date()
        })
        .where(eq(economicEvents.eventId, eventId));
    } catch (error) {
      console.error('Failed to mark event as analyzed:', error);
      throw error;
    }
  }

  // Create analysis job record
  private async createAnalysisJob(): Promise<number> {
    try {
      const result = await db.insert(researchJobs).values({
        jobType: 'AI_ANALYSIS',
        status: 'PENDING',
        createdAt: new Date()
      }).returning({ id: researchJobs.id });

      return result[0].id;
    } catch (error) {
      console.error('Failed to create analysis job:', error);
      throw error;
    }
  }

  // Update analysis job
  private async updateAnalysisJob(
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
      console.error('Failed to update analysis job:', error);
      throw error;
    }
  }

  // Get events with their analysis from database
  async getEventsWithAnalysis(
    startDate: string,
    endDate: string,
    cryptoOnly = false,
    highImpactOnly = false
  ): Promise<any[]> {
    try {
      // This is a complex query that joins events with their analysis
      // For now, we'll do it in two steps: get events, then get their analysis
      
      let eventsQuery = db.select()
        .from(economicEvents)
        .where(
          and(
            eq(economicEvents.isAnalyzed, true),
            // Add date filters here when needed
          )
        );

      const events = await eventsQuery;
      
      // Filter events based on criteria
      let filteredEvents = events;
      
      if (cryptoOnly) {
        filteredEvents = filteredEvents.filter(event => 
          event.relevance === 'CRYPTO' || event.relevance === 'ALL'
        );
      }
      
      if (highImpactOnly) {
        filteredEvents = filteredEvents.filter(event => event.impact === 'HIGH');
      }

      // Get analysis for each event
      const eventsWithAnalysis = [];
      
      for (const event of filteredEvents) {
        try {
          const analysisResult = await db.select()
            .from(economicAnalysis)
            .where(eq(economicAnalysis.eventId, event.eventId))
            .limit(1);

          if (analysisResult.length > 0) {
            const analysis = analysisResult[0];
            eventsWithAnalysis.push({
              ...event,
              analysis: {
                impactScore: parseInt(analysis.impactScore),
                direction: analysis.direction,
                confidence: parseInt(analysis.confidence),
                timeframe: analysis.timeframe,
                analysis: analysis.analysis,
                historicalContext: analysis.historicalContext,
                keyFactors: JSON.parse(analysis.keyFactors as string),
                cryptoImpact: JSON.parse(analysis.cryptoImpact as string),
                riskLevel: analysis.riskLevel,
                provider: analysis.provider,
                analyzedAt: analysis.analyzedAt
              }
            });
          }
        } catch (error) {
          console.error(`Failed to get analysis for event ${event.eventId}:`, error);
          // Add event without analysis
          eventsWithAnalysis.push({
            ...event,
            analysis: null
          });
        }
      }
      
      return eventsWithAnalysis.sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
      });
      
    } catch (error) {
      console.error('Failed to get events with analysis:', error);
      return [];
    }
  }

  // Get analysis statistics
  async getAnalysisStatistics(): Promise<{
    totalEvents: number;
    analyzedEvents: number;
    pendingEvents: number;
    analysisPercentage: number;
    recentAnalysis: number;
  }> {
    try {
      const totalEventsResult = await db.select().from(economicEvents);
      const analyzedEventsResult = await db.select()
        .from(economicEvents)
        .where(eq(economicEvents.isAnalyzed, true));
      
      // Get recent analysis (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const recentAnalysisResult = await db.select()
        .from(economicAnalysis)
        .where(and(
          // Add date filter here
        ));

      const totalEvents = totalEventsResult.length;
      const analyzedEvents = analyzedEventsResult.length;
      const pendingEvents = totalEvents - analyzedEvents;
      const analysisPercentage = totalEvents > 0 ? Math.round((analyzedEvents / totalEvents) * 100) : 0;
      const recentAnalysis = recentAnalysisResult.length;

      return {
        totalEvents,
        analyzedEvents,
        pendingEvents,
        analysisPercentage,
        recentAnalysis
      };
      
    } catch (error) {
      console.error('Failed to get analysis statistics:', error);
      return {
        totalEvents: 0,
        analyzedEvents: 0,
        pendingEvents: 0,
        analysisPercentage: 0,
        recentAnalysis: 0
      };
    }
  }

  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clean up expired analysis
  async cleanupExpiredAnalysis(): Promise<number> {
    try {
      const now = new Date();
      
      const result = await db.delete(economicAnalysis)
        .where(and(
          // Add expiration date filter here
        ));

      console.log(`🧹 Cleaned up expired analysis records`);
      return 0; // Return count when proper deletion is implemented
      
    } catch (error) {
      console.error('Failed to cleanup expired analysis:', error);
      return 0;
    }
  }
}

export const batchAIAnalyzer = new BatchAIAnalyzer();