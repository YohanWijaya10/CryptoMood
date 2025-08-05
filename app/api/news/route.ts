import { NextRequest, NextResponse } from 'next/server';
import { newsParser, NewsCategory } from '@/app/lib/news-parser';

export const runtime = 'nodejs';
export const revalidate = 1800; // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const category = (request.nextUrl.searchParams.get('category') as NewsCategory) || 'all';
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '12');

    // Validate parameters
    const validCategories: NewsCategory[] = ['all', 'crypto', 'finance', 'market', 'blockchain'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: all, crypto, finance, market, blockchain' },
        { status: 400 }
      );
    }

    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-50' },
        { status: 400 }
      );
    }

    console.log(`Fetching news: category=${category}, page=${page}, limit=${limit}`);
    
    const newsData = await newsParser.fetchNews(category, page, limit);

    // Calculate pagination info
    const totalPages = Math.ceil(newsData.totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      success: true,
      data: {
        ...newsData,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: newsData.totalItems,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage
        }
      },
      categories: [
        { value: 'all', label: 'All News' },
        { value: 'crypto', label: 'Cryptocurrency' },
        { value: 'finance', label: 'Finance' },
        { value: 'market', label: 'Market' },
        { value: 'blockchain', label: 'Blockchain' }
      ],
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });

  } catch (error) {
    console.error('News API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch news',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: {
          items: [],
          lastFetched: new Date().toISOString(),
          totalItems: 0,
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 12,
            hasNextPage: false,
            hasPrevPage: false
          }
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}