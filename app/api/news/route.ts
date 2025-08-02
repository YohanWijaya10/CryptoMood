import { NextRequest, NextResponse } from 'next/server';
import { coinDeskParser } from '@/app/lib/rss-parser';

export const runtime = 'nodejs';
export const revalidate = 1800; // 30 minutes

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching news from CoinDesk RSS...');
    
    const newsData = await coinDeskParser.fetchNews();
    
    console.log(`Found ${newsData.items.length} Bitcoin-related news items`);
    
    return NextResponse.json({
      success: true,
      data: newsData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('News API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}