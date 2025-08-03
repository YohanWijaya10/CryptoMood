import { eq, sql } from 'drizzle-orm';
import { db } from './db';
import { sentimentCache as sentimentCacheTable } from './db/schema';
import { SentimentResult } from './ai-sentiment';

export class SentimentCacheManager {

  private hashText(text: string): string {
    // Simple hash function for text content
    let hash = 0;
    if (text.length === 0) return hash.toString();
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  async getCachedSentiment(guid: string, text: string): Promise<SentimentResult | null> {
    try {
      const currentTextHash = this.hashText(text);
      
      const cached = await db
        .select()
        .from(sentimentCacheTable)
        .where(eq(sentimentCacheTable.guid, guid))
        .limit(1);

      if (cached.length === 0) return null;

      const cacheEntry = cached[0];

      // Check if text content has changed
      if (cacheEntry.textHash !== currentTextHash) {
        // Text has changed, remove from cache and return null
        await db
          .delete(sentimentCacheTable)
          .where(eq(sentimentCacheTable.guid, guid));
        return null;
      }

      // Check if cache is not too old (7 days)
      const cacheAge = Date.now() - new Date(cacheEntry.analyzedAt).getTime();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      
      if (cacheAge > maxAge) {
        await db
          .delete(sentimentCacheTable)
          .where(eq(sentimentCacheTable.guid, guid));
        return null;
      }

      return cacheEntry.sentiment as SentimentResult;
    } catch (error) {
      console.error('Error retrieving cached sentiment:', error);
      return null;
    }
  }

  async cacheSentiment(guid: string, text: string, sentiment: SentimentResult): Promise<void> {
    try {
      const textHash = this.hashText(text);
      
      await db
        .insert(sentimentCacheTable)
        .values({
          guid,
          sentiment,
          textHash,
          analyzedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: sentimentCacheTable.guid,
          set: {
            sentiment,
            textHash,
            analyzedAt: new Date(),
          },
        });
    } catch (error) {
      console.error('Error caching sentiment:', error);
    }
  }

  async getCacheStats(): Promise<{ totalCached: number; oldestEntry?: Date }> {
    try {
      const stats = await db
        .select({
          count: sql<number>`count(*)`,
          oldestEntry: sql<Date>`min(analyzed_at)`,
        })
        .from(sentimentCacheTable);

      return {
        totalCached: Number(stats[0]?.count || 0),
        oldestEntry: stats[0]?.oldestEntry,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalCached: 0 };
    }
  }

  async clearCache(): Promise<void> {
    try {
      await db.delete(sentimentCacheTable);
      console.log('Sentiment cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const sentimentCache = new SentimentCacheManager();