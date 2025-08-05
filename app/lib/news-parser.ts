import Parser from 'rss-parser';

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  publishDate: string;
  guid: string;
  imageUrl?: string;
  source: string;
  category: string;
}

export interface ParsedNews {
  items: NewsItem[];
  lastFetched: string;
  totalItems: number;
}

export type NewsCategory = 'all' | 'crypto' | 'finance' | 'market' | 'blockchain';

interface NewsSource {
  name: string;
  url: string;
  category: NewsCategory;
}

class NewsParser {
  private parser: Parser;
  private readonly NEWS_SOURCES: NewsSource[] = [
    // Crypto Sources
    { name: 'CoinDesk', url: 'https://feeds.coindesk.com/coindesk/rss', category: 'crypto' },
    { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss', category: 'crypto' },
    { name: 'Decrypt', url: 'https://decrypt.co/feed', category: 'crypto' },
    
    // Finance Sources
    { name: 'Yahoo Finance', url: 'https://feeds.finance.yahoo.com/rss/2.0/headline', category: 'finance' },
    { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', category: 'market' },
  ];

  private readonly RELEVANT_KEYWORDS = [
    // Crypto keywords
    'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency', 'blockchain', 'defi', 'nft',
    'altcoin', 'digital asset', 'virtual currency', 'web3', 'mining', 'staking', 'wallet',
    
    // Finance keywords
    'market', 'trading', 'investment', 'stock', 'finance', 'economy', 'economic', 'financial',
    'monetary', 'inflation', 'recession', 'bull market', 'bear market', 'volatility',
    'portfolio', 'dividend', 'earnings', 'revenue', 'profit', 'loss'
  ];

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['guid', 'pubDate', 'enclosure', 'media:content', 'media:thumbnail']
      }
    });
  }

  private isRelevantNews(title: string, description: string): boolean {
    const text = `${title} ${description}`.toLowerCase();
    return this.RELEVANT_KEYWORDS.some(keyword => text.includes(keyword));
  }

  private categorizeNews(title: string, description: string, sourceCategory: NewsCategory): NewsCategory {
    const text = `${title} ${description}`.toLowerCase();
    
    const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'defi', 'nft'];
    const financeKeywords = ['stock', 'investment', 'bank', 'financial', 'monetary', 'dividend'];
    const marketKeywords = ['market', 'trading', 'volatility', 'bull', 'bear', 'economy'];
    
    if (cryptoKeywords.some(keyword => text.includes(keyword))) {
      return 'crypto';
    } else if (financeKeywords.some(keyword => text.includes(keyword))) {
      return 'finance';
    } else if (marketKeywords.some(keyword => text.includes(keyword))) {
      return 'market';
    }
    
    return sourceCategory;
  }

  private formatDate(dateString: string): string {
    try {
      return new Date(dateString).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  private extractImageUrl(item: any): string | undefined {
    // Try media:content first
    if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
      return item['media:content']['$'].url;
    }
    
    // Try media:thumbnail
    if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
      return item['media:thumbnail']['$'].url;
    }
    
    // Try enclosure tag
    if (item.enclosure && item.enclosure.url) {
      return item.enclosure.url;
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

  private async tryFetchFromSource(source: NewsSource): Promise<NewsItem[]> {
    try {
      console.log(`Fetching from ${source.name}: ${source.url}`);
      const feed = await this.parser.parseURL(source.url);
      
      if (!feed.items) return [];

      const items = feed.items
        .filter((item: any) => {
          const title = item.title || '';
          const description = item.contentSnippet || item.description || '';
          return this.isRelevantNews(title, description);
        })
        .slice(0, 20) // Limit per source
        .map((item: any) => {
          const title = item.title || 'No title';
          const description = item.contentSnippet || item.description || 'No description';
          
          return {
            title,
            description,
            link: item.link || '',
            publishDate: this.formatDate(item.pubDate || ''),
            guid: item.guid || item.link || `${Date.now()}-${Math.random()}`,
            imageUrl: this.extractImageUrl(item),
            source: source.name,
            category: this.categorizeNews(title, description, source.category)
          };
        });

      console.log(`✅ Fetched ${items.length} relevant items from ${source.name}`);
      return items;
    } catch (error) {
      console.log(`❌ Failed to fetch from ${source.name}:`, error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  private getFallbackData(): NewsItem[] {
    return [
      {
        title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
        description: "Bitcoin continues its bullish momentum as major corporations increase their cryptocurrency holdings.",
        link: "https://example.com/bitcoin-ath",
        publishDate: new Date().toISOString(),
        guid: "fallback-1",
        source: "Demo",
        category: "crypto",
        imageUrl: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=250&fit=crop"
      },
      {
        title: "Stock Market Shows Strong Performance This Quarter",
        description: "Major indices continue to climb as investor confidence remains high amid positive economic indicators.",
        link: "https://example.com/stock-performance",
        publishDate: new Date(Date.now() - 3600000).toISOString(),
        guid: "fallback-2",
        source: "Demo",
        category: "market",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"
      },
      {
        title: "Federal Reserve Announces New Monetary Policy",
        description: "Central bank decisions continue to influence global financial markets and investment strategies.",
        link: "https://example.com/fed-policy",
        publishDate: new Date(Date.now() - 7200000).toISOString(),
        guid: "fallback-3",
        source: "Demo",
        category: "finance",
        imageUrl: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&h=250&fit=crop"
      }
    ];
  }

  async fetchNews(
    category: NewsCategory = 'all',
    page: number = 1,
    itemsPerPage: number = 12
  ): Promise<ParsedNews> {
    const allItems: NewsItem[] = [];
    
    // Fetch from all sources
    for (const source of this.NEWS_SOURCES) {
      const items = await this.tryFetchFromSource(source);
      allItems.push(...items);
    }

    // If no items fetched, use fallback
    if (allItems.length === 0) {
      console.log('⚠️ All sources failed, using fallback data');
      const fallbackItems = this.getFallbackData();
      return {
        items: fallbackItems,
        lastFetched: new Date().toISOString(),
        totalItems: fallbackItems.length
      };
    }

    // Filter by category
    let filteredItems = allItems;
    if (category !== 'all') {
      filteredItems = allItems.filter(item => item.category === category);
    }

    // Sort by date (newest first)
    filteredItems.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    // Remove duplicates by title
    const uniqueItems = filteredItems.filter((item, index, self) => 
      index === self.findIndex(i => i.title.toLowerCase() === item.title.toLowerCase())
    );

    // Pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = uniqueItems.slice(startIndex, endIndex);

    console.log(`Returning ${paginatedItems.length} news items (page ${page}, category: ${category})`);
    
    return {
      items: paginatedItems,
      lastFetched: new Date().toISOString(),
      totalItems: uniqueItems.length
    };
  }
}

export const newsParser = new NewsParser();