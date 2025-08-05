import { pgTable, varchar, jsonb, timestamp, text, boolean, serial, index } from 'drizzle-orm/pg-core';

export const sentimentCache = pgTable('sentiment_cache', {
  guid: varchar('guid', { length: 255 }).primaryKey(),
  sentiment: jsonb('sentiment').notNull(),
  textHash: varchar('text_hash', { length: 32 }).notNull(),
  analyzedAt: timestamp('analyzed_at').defaultNow().notNull(),
});

// Economic Events Master Table - Store all researched events
export const economicEvents = pgTable('economic_events', {
  id: serial('id').primaryKey(),
  eventId: varchar('event_id', { length: 100 }).notNull().unique(), // Unique identifier from source
  title: text('title').notNull(),
  description: text('description'),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD format
  time: varchar('time', { length: 5 }).notNull(), // HH:mm format (WIB)
  country: varchar('country', { length: 50 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  impact: varchar('impact', { length: 10 }).notNull(), // HIGH, MEDIUM, LOW
  category: varchar('category', { length: 20 }).notNull(), // INTEREST_RATE, INFLATION, etc
  actual: varchar('actual', { length: 50 }),
  forecast: varchar('forecast', { length: 50 }),
  previous: varchar('previous', { length: 50 }),
  source: varchar('source', { length: 100 }).notNull(), // investing.com, forexfactory.com, etc
  sourceUrl: text('source_url'), // Original URL
  relevance: varchar('relevance', { length: 15 }).notNull(), // CRYPTO, FOREX, STOCKS, ALL
  isAnalyzed: boolean('is_analyzed').default(false), // Track analysis status
  researchedAt: timestamp('researched_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  dateIdx: index('events_date_idx').on(table.date),
  countryIdx: index('events_country_idx').on(table.country),
  impactIdx: index('events_impact_idx').on(table.impact),
  relevanceIdx: index('events_relevance_idx').on(table.relevance),
  analyzedIdx: index('events_analyzed_idx').on(table.isAnalyzed),
}));

// Economic Analysis Results - Store AI analysis for each event
export const economicAnalysis = pgTable('economic_analysis', {
  id: serial('id').primaryKey(),
  eventId: varchar('event_id', { length: 100 }).notNull(), // Reference to economic_events.eventId
  impactScore: varchar('impact_score', { length: 10 }).notNull(), // 0-100
  direction: varchar('direction', { length: 10 }).notNull(), // BULLISH, BEARISH, NEUTRAL
  confidence: varchar('confidence', { length: 10 }).notNull(), // 0-100%
  timeframe: varchar('timeframe', { length: 50 }).notNull(), // "24-48 jam", "1 minggu", etc
  analysis: text('analysis').notNull(), // Main analysis text in Indonesian
  historicalContext: text('historical_context').notNull(), // Historical context
  keyFactors: jsonb('key_factors').notNull(), // Array of key factors
  cryptoImpact: jsonb('crypto_impact').notNull(), // {bitcoin, altcoins, defi}
  riskLevel: varchar('risk_level', { length: 10 }).notNull(), // TINGGI, SEDANG, RENDAH
  provider: varchar('provider', { length: 20 }).notNull(), // DeepSeek, Claude, etc
  analyzedAt: timestamp('analyzed_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(), // Analysis expiration
}, (table) => ({
  eventIdIdx: index('analysis_event_id_idx').on(table.eventId),
  directionIdx: index('analysis_direction_idx').on(table.direction),
  riskIdx: index('analysis_risk_idx').on(table.riskLevel),
}));

// Research Jobs - Track batch research tasks
export const researchJobs = pgTable('research_jobs', {
  id: serial('id').primaryKey(),
  jobType: varchar('job_type', { length: 20 }).notNull(), // 'SCRAPE_EVENTS', 'AI_ANALYSIS'
  status: varchar('status', { length: 15 }).notNull(), // 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
  source: varchar('source', { length: 50 }), // investing.com, forexfactory.com, etc
  targetDate: varchar('target_date', { length: 10 }), // YYYY-MM-DD for specific date scraping
  eventsFound: varchar('events_found', { length: 10 }), // Number of events found/analyzed
  errorMessage: text('error_message'), // Error details if failed
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('jobs_status_idx').on(table.status),
  typeIdx: index('jobs_type_idx').on(table.jobType),
  dateIdx: index('jobs_date_idx').on(table.targetDate),
}));

// Legacy cache table (keep for existing functionality)
export const economicAnalysisCache = pgTable('economic_analysis_cache', {
  eventHash: varchar('event_hash', { length: 64 }).primaryKey(), // Hash dari event data
  analysis: jsonb('analysis').notNull(), // Full AI analysis result
  eventData: jsonb('event_data').notNull(), // Original event data for reference
  analyzedAt: timestamp('analyzed_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(), // Cache expiration
});