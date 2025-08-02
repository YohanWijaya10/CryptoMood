// AI Sentiment Analysis - DeepSeek Only

export type SentimentLabel = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface SentimentResult {
  sentiment: SentimentLabel;
  score: number; // 0-100
  confidence: number; // 0-1
  reasoning?: string;
  provider: string;
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
              - reasoning: brief explanation of your analysis
              
              Focus on Bitcoin/cryptocurrency market impact.`
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

      const parsed = JSON.parse(content);
      return {
        sentiment: parsed.sentiment,
        score: parsed.score,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
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
    // Simple keyword-based sentiment for demo purposes
    const positiveKeywords = ['bitcoin', 'bullish', 'adoption', 'growth', 'surge', 'rally', 'positive', 'gains', 'up'];
    const negativeKeywords = ['crash', 'drop', 'bearish', 'decline', 'fall', 'negative', 'down', 'loss', 'sell'];
    
    const lowerText = text.toLowerCase();
    
    const positiveCount = positiveKeywords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeKeywords.filter(word => lowerText.includes(word)).length;
    
    let sentiment: SentimentLabel;
    let score: number;
    
    if (positiveCount > negativeCount) {
      sentiment = 'POSITIVE';
      score = 60 + (positiveCount * 5);
    } else if (negativeCount > positiveCount) {
      sentiment = 'NEGATIVE';
      score = 40 - (negativeCount * 5);
    } else {
      sentiment = 'NEUTRAL';
      score = 50;
    }
    
    // Clamp score between 0-100
    score = Math.max(0, Math.min(100, score));
    
    return {
      sentiment,
      score,
      confidence: 0.7,
      reasoning: `Keyword-based analysis: ${positiveCount} positive, ${negativeCount} negative keywords found`,
      provider: this.name,
    };
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