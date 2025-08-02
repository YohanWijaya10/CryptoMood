import { NextRequest, NextResponse } from 'next/server';
import { sentimentAnalyzer } from '@/app/lib/ai-sentiment';
import { coinDeskParser } from '@/app/lib/rss-parser';

export const runtime = 'nodejs';
export const revalidate = 1800; // 30 minutes

interface AnalyzedNewsItem {
  title: string;
  description: string;
  link: string;
  publishDate: string;
  guid: string;
  sentiment: {
    sentiment: string;
    score: number;
    confidence: number;
    reasoning?: string;
    provider: string;
    keyFactors?: string[];
    marketImpact?: 'HIGH' | 'MEDIUM' | 'LOW';
    riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('Starting sentiment analysis...');
    
    // Get available providers for logging
    const availableProviders = sentimentAnalyzer.getAvailableProviders();
    console.log('Available sentiment providers:', availableProviders);
    
    // Fetch latest news
    const newsData = await coinDeskParser.fetchNews();
    
    if (newsData.items.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          overallSentiment: {
            averageScore: 50,
            sentiment: 'NEUTRAL',
            totalItems: 0,
            lastAnalyzed: new Date().toISOString(),
          },
          meta: {
            lastFetched: newsData.lastFetched,
            availableProviders,
          }
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    console.log(`Analyzing sentiment for ${newsData.items.length} news items...`);
    
    // Analyze sentiment for each news item
    const analyzedItems: AnalyzedNewsItem[] = [];
    const sentimentScores: number[] = [];
    
    for (const item of newsData.items) {
      try {
        const textToAnalyze = `${item.title} ${item.description}`;
        const sentimentResult = await sentimentAnalyzer.analyze(textToAnalyze);
        
        analyzedItems.push({
          ...item,
          sentiment: sentimentResult,
        });
        
        sentimentScores.push(sentimentResult.score);
        console.log(`Analyzed: "${item.title.substring(0, 50)}..." - ${sentimentResult.sentiment} (${sentimentResult.score})`);
      } catch (error) {
        console.error(`Failed to analyze sentiment for item: ${item.title}`, error);
        
        // Add item with fallback sentiment
        analyzedItems.push({
          ...item,
          sentiment: {
            sentiment: 'NEUTRAL',
            score: 50,
            confidence: 0.1,
            reasoning: 'Failed to analyze sentiment',
            provider: 'Fallback',
            keyFactors: ['analysis failed'],
            marketImpact: 'LOW',
            riskLevel: 'MEDIUM',
          },
        });
        sentimentScores.push(50);
      }
    }
    
    // Calculate overall sentiment
    const averageScore = sentimentScores.length > 0 
      ? Math.round(sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length)
      : 50;
    
    const overallSentiment = averageScore >= 60 ? 'POSITIVE' 
      : averageScore <= 40 ? 'NEGATIVE' 
      : 'NEUTRAL';
    
    console.log(`Analysis complete. Overall sentiment: ${overallSentiment} (${averageScore}/100)`);
    
    return NextResponse.json({
      success: true,
      data: {
        items: analyzedItems,
        overallSentiment: {
          averageScore,
          sentiment: overallSentiment,
          totalItems: analyzedItems.length,
          lastAnalyzed: new Date().toISOString(),
        },
        meta: {
          lastFetched: newsData.lastFetched,
          availableProviders,
        }
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Sentiment API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze sentiment',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }
    
    const result = await sentimentAnalyzer.analyze(text);
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze sentiment',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}