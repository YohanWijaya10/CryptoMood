import { NextRequest, NextResponse } from 'next/server';
import { economicResearcher } from '@/app/lib/economic-research';
import { batchAIAnalyzer } from '@/app/lib/batch-ai-analysis';

export const runtime = 'nodejs';

// POST /api/research - Start economic calendar research
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const action = searchParams.get('action') || 'research';
    const daysAhead = parseInt(searchParams.get('days') || '30');

    console.log(`🔍 Research API called with action: ${action}, days: ${daysAhead}`);

    switch (action) {
      case 'research':
        // Start economic calendar research
        const researchResult = await economicResearcher.researchEconomicEvents(daysAhead);
        
        return NextResponse.json({
          success: true,
          message: 'Economic calendar research completed',
          data: {
            eventsFound: researchResult.length,
            daysAhead,
            sources: ['investing.com', 'forexfactory.com'],
            completedAt: new Date().toISOString()
          }
        });

      case 'analyze':
        // Start batch AI analysis
        const batchSize = parseInt(searchParams.get('batchSize') || '10');
        const analysisResult = await batchAIAnalyzer.runBatchAnalysis(batchSize);
        
        return NextResponse.json({
          success: true,
          message: 'Batch AI analysis completed',
          data: {
            ...analysisResult,
            batchSize,
            completedAt: new Date().toISOString()
          }
        });

      case 'full':
        // Run full research + analysis pipeline
        console.log('🚀 Starting full research pipeline...');
        
        // Step 1: Research events
        const events = await economicResearcher.researchEconomicEvents(daysAhead);
        console.log(`✅ Research completed: ${events.length} events found`);
        
        // Step 2: Wait a moment, then analyze
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 3: Run AI analysis
        const analysis = await batchAIAnalyzer.runBatchAnalysis(5); // Smaller batch for full pipeline
        console.log(`✅ Analysis completed: ${analysis.successfulAnalysis} events analyzed`);
        
        return NextResponse.json({
          success: true,
          message: 'Full research pipeline completed',
          data: {
            research: {
              eventsFound: events.length,
              daysAhead
            },
            analysis: {
              ...analysis
            },
            completedAt: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: research, analyze, or full'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Research API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Research operation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/research - Get research status and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || 'status';

    switch (type) {
      case 'status':
        // Get research jobs status
        const jobs = await economicResearcher.getResearchJobs(10);
        const stats = await batchAIAnalyzer.getAnalysisStatistics();
        
        return NextResponse.json({
          success: true,
          data: {
            recentJobs: jobs,
            statistics: stats,
            lastUpdated: new Date().toISOString()
          }
        });

      case 'events':
        // Get events from database
        const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
        const endDate = searchParams.get('endDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const cryptoOnly = searchParams.get('crypto') === 'true';
        const highImpactOnly = searchParams.get('impact') === 'high';
        const analyzed = searchParams.get('analyzed') === 'true';

        let events;
        if (analyzed) {
          events = await batchAIAnalyzer.getEventsWithAnalysis(startDate, endDate, cryptoOnly, highImpactOnly);
        } else {
          events = await economicResearcher.getEventsFromDatabase(startDate, endDate, cryptoOnly, highImpactOnly);
        }

        // Group events by date
        const eventsByDate = events.reduce((acc, event) => {
          const date = event.date;
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(event);
          return acc;
        }, {} as Record<string, typeof events>);

        return NextResponse.json({
          success: true,
          data: {
            events,
            eventsByDate,
            totalEvents: events.length,
            dateRange: { startDate, endDate },
            filters: { cryptoOnly, highImpactOnly, analyzed },
            lastUpdated: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Use: status or events'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Research API GET error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get research data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}