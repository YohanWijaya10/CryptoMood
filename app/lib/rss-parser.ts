import Parser from 'rss-parser';

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  publishDate: string;
  guid: string;
  imageUrl?: string;
}

export interface ParsedNews {
  items: NewsItem[];
  lastFetched: string;
}

class CoinDeskRSSParser {
  private parser: Parser;
  private readonly RSS_URLS = [
    'https://cointelegraph.com/rss',
    'https://decrypt.co/feed',
    'https://feeds.feedburner.com/coindesk/CoinDesk',
    'https://feeds.coindesk.com/coindesk/rss'
  ];
  private readonly BITCOIN_KEYWORDS = ['bitcoin', 'btc', 'crypto', 'cryptocurrency', 'blockchain', 'digital currency', 'digital asset', 'virtual currency'];

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['guid', 'pubDate', 'enclosure', 'media:content']
      }
    });
  }

  private isBitcoinRelated(title: string, description: string): boolean {
    const text = `${title} ${description}`.toLowerCase();
    return this.BITCOIN_KEYWORDS.some(keyword => text.includes(keyword));
  }

  private formatDate(dateString: string): string {
    try {
      return new Date(dateString).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  private extractImageUrl(item: any): string | undefined {
    // Try media:content first (Cointelegraph, Decrypt)
    if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
      return item['media:content']['$'].url;
    }
    
    // Try enclosure tag
    if (item.enclosure && item.enclosure.url) {
      return item.enclosure.url;
    }
    
    // Try direct enclosure property
    if (item.enclosure && typeof item.enclosure === 'string') {
      return item.enclosure;
    }
    
    // Try image tag in content
    if (item.content || item.description) {
      const content = item.content || item.description;
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
      }
    }
    
    return undefined;
  }

  private async tryFetchFromRSS(url: string): Promise<any> {
    try {
      console.log(`Trying RSS feed: ${url}`);
      const feed = await this.parser.parseURL(url);
      console.log(`✅ Successfully fetched ${feed.items?.length || 0} items from ${url}`);
      return feed;
    } catch (error) {
      console.log(`❌ Failed to fetch from ${url}:`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  private getFallbackData(): NewsItem[] {
    return [
      {
        title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
        description: "Bitcoin continues its bullish momentum as major corporations and financial institutions increase their cryptocurrency holdings, driving positive market sentiment.",
        link: "https://example.com/bitcoin-ath",
        publishDate: new Date().toISOString(),
        guid: "fallback-1",
        imageUrl: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=250&fit=crop"
      },
      {
        title: "Major Bank Announces Bitcoin Investment Strategy",
        description: "A leading financial institution reveals plans to allocate a significant portion of its treasury to Bitcoin, citing long-term value proposition and inflation hedge capabilities.",
        link: "https://example.com/bank-bitcoin",
        publishDate: new Date(Date.now() - 3600000).toISOString(),
        guid: "fallback-2",
        imageUrl: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&h=250&fit=crop"
      },
      {
        title: "Cryptocurrency Market Shows Strong Growth Signals",
        description: "Technical analysis indicates continued upward momentum in the crypto market, with Bitcoin leading the charge as institutional interest grows.",
        link: "https://example.com/crypto-growth",
        publishDate: new Date(Date.now() - 7200000).toISOString(),
        guid: "fallback-3",
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop"
      },
      {
        title: "Bitcoin Network Sees Record Transaction Volume",
        description: "The Bitcoin network processes unprecedented transaction volumes as adoption increases across various sectors, demonstrating network resilience and scalability improvements.",
        link: "https://example.com/btc-volume",
        publishDate: new Date(Date.now() - 10800000).toISOString(),
        guid: "fallback-4",
        imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=250&fit=crop"
      },
      {
        title: "Regulatory Clarity Boosts Bitcoin Market Confidence",
        description: "Recent regulatory developments provide clearer guidelines for cryptocurrency operations, leading to increased confidence among investors and institutions.",
        link: "https://example.com/regulation-clarity",
        publishDate: new Date(Date.now() - 14400000).toISOString(),
        guid: "fallback-5",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"
      }
    ];
  }

  async fetchNews(language: 'en' | 'id' = 'en'): Promise<ParsedNews> {
    // Try multiple RSS sources
    for (const url of this.RSS_URLS) {
      const feed = await this.tryFetchFromRSS(url);
      
      if (feed && feed.items) {
        console.log(`Using RSS source: ${url}`);
        
        // First try with Bitcoin filter
        let items: NewsItem[] = feed.items
          .filter((item: any) => {
            const title = item.title || '';
            const description = item.contentSnippet || item.description || '';
            const isRelated = this.isBitcoinRelated(title, description);
            if (isRelated) {
              console.log(`Bitcoin-related: "${title.substring(0, 50)}..."`);
            }
            return isRelated;
          })
          .slice(0, 10)
          .map((item: any) => ({
            title: item.title || 'No title',
            description: item.contentSnippet || item.description || 'No description',
            link: item.link || '',
            publishDate: this.formatDate(item.pubDate || ''),
            guid: item.guid || item.link || `${Date.now()}-${Math.random()}`,
            imageUrl: this.extractImageUrl(item)
          }));

        // If no Bitcoin news found, take general crypto news
        if (items.length === 0) {
          console.log('No Bitcoin-specific news found, taking general crypto news...');
          items = feed.items
            .slice(0, 5)
            .map((item: any) => ({
              title: item.title || 'No title',
              description: item.contentSnippet || item.description || 'No description',
              link: item.link || '',
              publishDate: this.formatDate(item.pubDate || ''),
              guid: item.guid || item.link || `${Date.now()}-${Math.random()}`,
              imageUrl: this.extractImageUrl(item)
            }));
        }

        if (items.length > 0) {
          console.log(`Returning ${items.length} news items for sentiment analysis`);
          return {
            items,
            lastFetched: new Date().toISOString()
          };
        }
      }
    }

    // If all RSS sources fail, use fallback data
    console.log('⚠️ All RSS sources failed, using fallback demo data');
    const fallbackItems = this.getFallbackData();
    
    return {
      items: fallbackItems,
      lastFetched: new Date().toISOString()
    };
  }
}

export const coinDeskParser = new CoinDeskRSSParser();