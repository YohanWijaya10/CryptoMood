import { NextRequest, NextResponse } from 'next/server';
import { createFREDEconomicCalendar } from '@/app/lib/fred-economic-calendar';
import { economicCalendarParser } from '@/app/lib/economic-calendar';

export const runtime = 'nodejs';
export const revalidate = 3600; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Parse query parameters
    const cryptoOnly = searchParams.get('crypto') === 'true';
    const highImpactOnly = searchParams.get('impact') === 'high';
    const daysAhead = parseInt(searchParams.get('days') || '7');
    const date = searchParams.get('date');

    // Validate parameters
    if (daysAhead < 1 || daysAhead > 30) {
      return NextResponse.json(
        { error: 'Days parameter must be between 1 and 30' },
        { status: 400 }
      );
    }

    console.log(`Fetching economic events: crypto=${cryptoOnly}, impact=${highImpactOnly}, days=${daysAhead}, date=${date}`);

    let events;

    // Use FRED-based economic calendar for consistent data
    console.log('🏛️ Using Federal Reserve-based economic calendar for consistent data');
    const fredCalendar = createFREDEconomicCalendar();

    try {
      if (date) {
        // Get all events and filter by date
        const allEvents = await fredCalendar.getEvents(30); // Get more days to find specific date
        events = allEvents.filter(event => event.date === date);
        
        if (cryptoOnly) {
          events = events.filter(event => event.relevance === 'CRYPTO' || event.relevance === 'ALL');
        }
      } else {
        // Get events based on filters
        if (highImpactOnly && cryptoOnly) {
          const cryptoEvents = await fredCalendar.getCryptoRelevantEvents(daysAhead);
          events = cryptoEvents.filter(event => event.impact === 'HIGH');
        } else if (highImpactOnly) {
          events = await fredCalendar.getHighImpactEvents(daysAhead);
        } else if (cryptoOnly) {
          events = await fredCalendar.getCryptoRelevantEvents(daysAhead);
        } else {
          events = await fredCalendar.getEvents(daysAhead);
        }
      }

      console.log(`✅ FRED calendar returned ${events.length} consistent events`);

      if (date) {
        return NextResponse.json({
          success: true,
          data: {
            events,
            date,
            totalEvents: events.length,
            lastUpdated: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        });
      }

    } catch (error) {
      console.error('❌ FRED calendar failed, falling back to mock data:', error);
      // Fall through to mock data fallback
    }

    // Fallback to mock data if FRED calendar fails
    console.log('📊 Using fallback mock data');
    
    if (date) {
      // Get events for specific date
      events = await economicCalendarParser.getEventsByDate(date, cryptoOnly);
      
      return NextResponse.json({
        success: true,
        data: {
          events,
          date,
          totalEvents: events.length,
          lastUpdated: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      });
    }

    if (highImpactOnly && cryptoOnly) {
      // Get high impact crypto-relevant events
      const allEvents = await economicCalendarParser.getCryptoRelevantEventsOnly(daysAhead);
      events = allEvents.filter(event => event.impact === 'HIGH');
    } else if (highImpactOnly) {
      // Get high impact events only
      events = await economicCalendarParser.getHighImpactEvents(daysAhead);
    } else if (cryptoOnly) {
      // Get crypto-relevant events only
      events = await economicCalendarParser.getCryptoRelevantEventsOnly(daysAhead);
    } else {
      // Get all events
      const calendarData = await economicCalendarParser.fetchEconomicEvents(false, daysAhead);
      events = calendarData.events;
    }

    // Group events by date for easier frontend consumption
    const eventsByDate = events.reduce((acc, event) => {
      const date = event.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {} as Record<string, typeof events>);

    // Calculate statistics
    const impactCounts = events.reduce((acc, event) => {
      acc[event.impact] = (acc[event.impact] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const countryCounts = events.reduce((acc, event) => {
      acc[event.country] = (acc[event.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      success: true,
      data: {
        events,
        eventsByDate,
        totalEvents: events.length,
        daysAhead,
        filters: {
          cryptoOnly,
          highImpactOnly
        },
        statistics: {
          impactBreakdown: impactCounts,
          countryBreakdown: countryCounts
        },
        lastUpdated: new Date().toISOString()
      },
      categories: [
        { value: 'all', label: 'All Events' },
        { value: 'crypto', label: 'Crypto Relevant' },
        { value: 'high', label: 'High Impact' },
        { value: 'interest_rate', label: 'Interest Rates' },
        { value: 'inflation', label: 'Inflation' },
        { value: 'employment', label: 'Employment' }
      ],
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });

  } catch (error) {
    console.error('Economic Calendar API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch economic calendar',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: {
        events: [],
        eventsByDate: {},
        totalEvents: 0,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  }
}