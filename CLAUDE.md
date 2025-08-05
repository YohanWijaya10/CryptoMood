# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CryptoTune is a comprehensive cryptocurrency news platform built with Next.js 14. It aggregates news from multiple sources, provides AI-powered sentiment analysis, and features a multi-page news portal with filtering and pagination.

## Development Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Architecture

### Core Components
- **RSS Parser** (`app/lib/rss-parser.ts`): Bitcoin-focused news with sentiment analysis
- **News Parser** (`app/lib/news-parser.ts`): Multi-source news aggregation with categorization
- **Economic Calendar** (`app/lib/economic-calendar.ts`): Economic events tracking with crypto relevance
- **AI Sentiment Analysis** (`app/lib/ai-sentiment.ts`): Multi-provider sentiment analysis with fallbacks
- **API Routes**: `/api/news` (multi-source news), `/api/sentiment` (Bitcoin sentiment), `/api/economic-calendar` (economic events)
- **Dashboard**: React components for displaying Bitcoin sentiment data
- **News Page**: Multi-source news portal with filtering and pagination
- **Economic Calendar**: Economic events calendar with impact analysis and crypto relevance filtering

### AI Provider Chain
1. **DeepSeek** (primary) - Requires `DEEPSEEK_API_KEY`
2. **Mock Provider** (fallback) - Always available, keyword-based analysis

### Data Flow
**Dashboard (Bitcoin Sentiment):**
1. RSS parser fetches Bitcoin-focused news → filters Bitcoin-related articles
2. Sentiment analyzer processes each article → returns sentiment score (0-100)
3. Dashboard displays overall sentiment + individual news cards with AI analysis

**News Page (Multi-Source):**
1. News parser fetches from 5 sources → categorizes and filters relevant content
2. API provides paginated results with category filtering
3. News page displays cards with category badges, search, and pagination

**Economic Calendar:**
1. Economic calendar parser generates/fetches economic events → filters by crypto relevance and impact
2. API provides events grouped by date with filtering options
3. Calendar page displays events with country flags, impact levels, and data comparisons
4. ISR caching (1 hour) + auto-refresh for performance

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- `DEEPSEEK_API_KEY` (recommended - cost-effective and powerful)

Note: App works without API keys using mock provider.

## Key Features
- **Multi-Page Application**: Dashboard (sentiment) + News portal + Economic Calendar
- **Multi-Source News**: CoinDesk, Cointelegraph, Decrypt, Yahoo Finance, MarketWatch
- **Economic Calendar**: Track major economic events with crypto relevance filtering
- **Advanced Filtering**: Category-based filtering, search functionality, and impact levels
- **Pagination**: 12 items per page with navigation controls
- **Real-Time Data**: Live economic events with actual vs forecast comparisons
- **ISR**: Smart caching (30min news, 1hr calendar) for performance
- **Responsive**: Mobile-first Tailwind CSS design
- **Error Handling**: Graceful fallbacks throughout
- **Loading States**: Proper UX with skeleton screens
- **SEO Ready**: Metadata and OpenGraph tags configured
- **Image Optimization**: Next.js Image component with multiple domain support

## File Structure Priority
- Core logic: `app/lib/` (RSS parser, AI sentiment)
- API endpoints: `app/api/` (news, sentiment)
- UI components: `app/components/` (Dashboard, NewsCard, SentimentScore)
- Main pages: `app/page.tsx`, `app/layout.tsx`

## Development Notes
- TypeScript strict mode enabled
- Tailwind custom colors for sentiment (crypto-green, crypto-red, crypto-yellow)
- API routes use `revalidate = 1800` for caching
- Error boundaries and loading states implemented
- CoinDesk RSS endpoint: `https://feeds.coindesk.com/coindesk/rss.json`