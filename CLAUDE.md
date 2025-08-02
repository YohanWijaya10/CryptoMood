# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CryptoMood is a Bitcoin news sentiment analyzer MVP built with Next.js 14. It scrapes CoinDesk RSS feeds and uses AI to analyze market sentiment, displaying results in a responsive dashboard.

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
- **RSS Parser** (`app/lib/rss-parser.ts`): Fetches and filters Bitcoin news from CoinDesk
- **AI Sentiment Analysis** (`app/lib/ai-sentiment.ts`): Multi-provider sentiment analysis with fallbacks
- **API Routes**: `/api/news` (news fetching) and `/api/sentiment` (sentiment analysis)
- **Dashboard**: React components for displaying sentiment data

### AI Provider Chain
1. **DeepSeek** (primary) - Requires `DEEPSEEK_API_KEY`
2. **Mock Provider** (fallback) - Always available, keyword-based analysis

### Data Flow
1. RSS parser fetches CoinDesk news → filters Bitcoin-related articles
2. Sentiment analyzer processes each article → returns sentiment score (0-100)
3. Dashboard displays overall sentiment + individual news cards
4. ISR caching (30 min) + auto-refresh for performance

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- `DEEPSEEK_API_KEY` (recommended - cost-effective and powerful)

Note: App works without API keys using mock provider.

## Key Features
- **ISR**: 30-minute revalidation for performance
- **Responsive**: Mobile-first Tailwind CSS design
- **Error Handling**: Graceful fallbacks throughout
- **Loading States**: Proper UX with skeleton screens
- **SEO Ready**: Metadata and OpenGraph tags configured

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