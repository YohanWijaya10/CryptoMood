// AI Sentiment Analysis - DeepSeek Only

export type SentimentLabel = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface SentimentResult {
  sentiment: SentimentLabel;
  score: number; // 0-100
  confidence: number; // 0-1
  reasoning?: string;
  provider: string;
  keyFactors?: string[];
  marketImpact?: 'HIGH' | 'MEDIUM' | 'LOW';
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SentimentAnalysisProvider {
  name: string;
  analyze(text: string): Promise<SentimentResult>;
  isAvailable(): boolean;
}

// DeepSeek Provider
class DeepSeekProvider implements SentimentAnalysisProvider {
  name = 'DeepSeek';
  private apiKey: string | null = null;
  private baseURL = 'https://api.deepseek.com/v1';

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || null;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async analyze(text: string): Promise<SentimentResult> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not available');
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a financial sentiment analyzer specialized in cryptocurrency news. 
              Analyze the sentiment of the given text and respond with a JSON object containing:
              - sentiment: "POSITIVE", "NEGATIVE", or "NEUTRAL"
              - score: number from 0-100 (0 = very negative, 50 = neutral, 100 = very positive)
              - confidence: number from 0-1 indicating how confident you are
              - reasoning: detailed explanation of your analysis (2-3 sentences)
              - keyFactors: array of 2-4 key phrases/factors that influenced the sentiment
              - marketImpact: "HIGH", "MEDIUM", or "LOW" - potential impact on Bitcoin price
              - riskLevel: "HIGH", "MEDIUM", or "LOW" - investment risk level based on the news
              
              Focus on Bitcoin/cryptocurrency market impact, regulatory implications, adoption trends, and technical developments.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from DeepSeek');
      }

      // Clean markdown formatting from response
      const cleanContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const parsed = JSON.parse(cleanContent);
      return {
        sentiment: parsed.sentiment,
        score: parsed.score,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        keyFactors: parsed.keyFactors || [],
        marketImpact: parsed.marketImpact || 'MEDIUM',
        riskLevel: parsed.riskLevel || 'MEDIUM',
        provider: this.name,
      };
    } catch (error) {
      console.error('DeepSeek analysis error:', error);
      throw error;
    }
  }
}


// Fallback/Mock Provider
class MockProvider implements SentimentAnalysisProvider {
  name = 'Mock Provider';

  isAvailable(): boolean {
    return true;
  }

  async analyze(text: string): Promise<SentimentResult> {
    // Enhanced keyword-based sentiment analysis
    const positiveKeywords = ['bitcoin', 'bullish', 'adoption', 'growth', 'surge', 'rally', 'positive', 'gains', 'up', 'breakthrough', 'institutional', 'etf', 'regulation clarity'];
    const negativeKeywords = ['crash', 'drop', 'bearish', 'decline', 'fall', 'negative', 'down', 'loss', 'sell', 'ban', 'restriction', 'volatility', 'hack', 'scam'];
    const neutralKeywords = ['analysis', 'report', 'study', 'research', 'data', 'statistics'];
    
    const lowerText = text.toLowerCase();
    
    const positiveMatches = positiveKeywords.filter(word => lowerText.includes(word));
    const negativeMatches = negativeKeywords.filter(word => lowerText.includes(word));
    const neutralMatches = neutralKeywords.filter(word => lowerText.includes(word));
    
    const positiveCount = positiveMatches.length;
    const negativeCount = negativeMatches.length;
    
    let sentiment: SentimentLabel;
    let score: number;
    let keyFactors: string[] = [];
    let marketImpact: 'HIGH' | 'MEDIUM' | 'LOW';
    let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    
    if (positiveCount > negativeCount) {
      sentiment = 'POSITIVE';
      score = 60 + (positiveCount * 5);
      keyFactors = positiveMatches.slice(0, 3);
      marketImpact = positiveCount >= 3 ? 'HIGH' : 'MEDIUM';
      riskLevel = positiveCount >= 4 ? 'LOW' : 'MEDIUM';
    } else if (negativeCount > positiveCount) {
      sentiment = 'NEGATIVE';
      score = 40 - (negativeCount * 5);
      keyFactors = negativeMatches.slice(0, 3);
      marketImpact = negativeCount >= 3 ? 'HIGH' : 'MEDIUM';
      riskLevel = negativeCount >= 3 ? 'HIGH' : 'MEDIUM';
    } else {
      sentiment = 'NEUTRAL';
      score = 50;
      keyFactors = [...neutralMatches, ...positiveMatches, ...negativeMatches].slice(0, 2);
      marketImpact = 'LOW';
      riskLevel = 'MEDIUM';
    }
    
    // Clamp score between 0-100
    score = Math.max(0, Math.min(100, score));
    
    const reasoning = this.generateReasoning(sentiment, positiveCount, negativeCount, keyFactors);
    
    return {
      sentiment,
      score,
      confidence: 0.7,
      reasoning,
      keyFactors: keyFactors.length > 0 ? keyFactors : ['general market sentiment'],
      marketImpact,
      riskLevel,
      provider: this.name,
    };
  }

  private generateReasoning(sentiment: SentimentLabel, positiveCount: number, negativeCount: number, keyFactors: string[]): string {
    const factorsStr = keyFactors.length > 0 ? keyFactors.join(', ') : 'general market indicators';
    
    switch (sentiment) {
      case 'POSITIVE':
        return `Analysis shows bullish sentiment based on ${positiveCount} positive indicators including: ${factorsStr}. This suggests potential upward price movement and positive market reception.`;
      case 'NEGATIVE':
        return `Analysis indicates bearish sentiment with ${negativeCount} negative factors detected: ${factorsStr}. This may lead to downward pressure on Bitcoin price and increased market caution.`;
      default:
        return `Neutral sentiment detected with balanced positive (${positiveCount}) and negative (${negativeCount}) indicators. Key factors: ${factorsStr}. Market impact likely to be minimal in the short term.`;
    }
  }
}

// Sentiment Analyzer with fallback chain
export class SentimentAnalyzer {
  private providers: SentimentAnalysisProvider[] = [];

  constructor() {
    this.providers = [
      new DeepSeekProvider(),
      new MockProvider(), // Fallback if DeepSeek is unavailable
    ];
  }

  async analyze(text: string): Promise<SentimentResult> {
    for (const provider of this.providers) {
      if (provider.isAvailable()) {
        try {
          const result = await provider.analyze(text);
          console.log(`Sentiment analysis successful with ${provider.name}`);
          return result;
        } catch (error) {
          console.error(`${provider.name} failed:`, error);
          continue; // Try next provider
        }
      }
    }

    throw new Error('All sentiment analysis providers failed');
  }

  getAvailableProviders(): string[] {
    return this.providers
      .filter(provider => provider.isAvailable())
      .map(provider => provider.name);
  }
}

export const sentimentAnalyzer = new SentimentAnalyzer();