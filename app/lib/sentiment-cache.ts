import { promises as fs } from 'fs';
import { join } from 'path';
import { SentimentResult } from './ai-sentiment';

interface CachedSentiment {
  guid: string;
  sentiment: SentimentResult;
  analyzedAt: string;
  textHash: string; // Hash of analyzed text to detect changes
}

interface SentimentCache {
  [guid: string]: CachedSentiment;
}

export class SentimentCacheManager {
  private cacheFilePath: string;
  private cache: SentimentCache = {};
  private isLoaded = false;

  constructor() {
    // Store cache in tmp directory to avoid deployment issues
    this.cacheFilePath = join(process.cwd(), 'tmp', 'sentiment-cache.json');
  }

  private async ensureCacheDir(): Promise<void> {
    const cacheDir = join(process.cwd(), 'tmp');
    try {
      await fs.mkdir(cacheDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  private async loadCache(): Promise<void> {
    if (this.isLoaded) return;

    try {
      await this.ensureCacheDir();
      const data = await fs.readFile(this.cacheFilePath, 'utf-8');
      this.cache = JSON.parse(data);
      console.log(`Loaded ${Object.keys(this.cache).length} cached sentiment results`);
    } catch (error) {
      // Cache file doesn't exist or is invalid, start with empty cache
      this.cache = {};
      console.log('Starting with empty sentiment cache');
    }
    this.isLoaded = true;
  }

  private async saveCache(): Promise<void> {
    try {
      await this.ensureCacheDir();
      await fs.writeFile(this.cacheFilePath, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Failed to save sentiment cache:', error);
    }
  }

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
    await this.loadCache();
    
    const cached = this.cache[guid];
    if (!cached) return null;

    // Check if text content has changed
    const currentTextHash = this.hashText(text);
    if (cached.textHash !== currentTextHash) {
      // Text has changed, remove from cache and return null
      delete this.cache[guid];
      await this.saveCache();
      return null;
    }

    // Check if cache is not too old (7 days)
    const cacheAge = Date.now() - new Date(cached.analyzedAt).getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    if (cacheAge > maxAge) {
      delete this.cache[guid];
      await this.saveCache();
      return null;
    }

    return cached.sentiment;
  }

  async cacheSentiment(guid: string, text: string, sentiment: SentimentResult): Promise<void> {
    await this.loadCache();
    
    this.cache[guid] = {
      guid,
      sentiment,
      analyzedAt: new Date().toISOString(),
      textHash: this.hashText(text),
    };

    await this.saveCache();
  }

  async getCacheStats(): Promise<{ totalCached: number; cacheFilePath: string }> {
    await this.loadCache();
    return {
      totalCached: Object.keys(this.cache).length,
      cacheFilePath: this.cacheFilePath,
    };
  }

  async clearCache(): Promise<void> {
    this.cache = {};
    await this.saveCache();
    console.log('Sentiment cache cleared');
  }
}

export const sentimentCache = new SentimentCacheManager();