import { pgTable, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const sentimentCache = pgTable('sentiment_cache', {
  guid: varchar('guid', { length: 255 }).primaryKey(),
  sentiment: jsonb('sentiment').notNull(),
  textHash: varchar('text_hash', { length: 32 }).notNull(),
  analyzedAt: timestamp('analyzed_at').defaultNow().notNull(),
});