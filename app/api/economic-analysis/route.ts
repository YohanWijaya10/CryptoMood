import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { economicAnalysisCache } from '@/app/lib/db/schema';
import { eq, gt } from 'drizzle-orm';
import crypto from 'crypto';

interface EconomicEventAnalysis {
  impactScore: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  timeframe: string;
  analysis: string;
  historicalContext: string;
  keyFactors: string[];
  cryptoImpact: {
    bitcoin: string;
    altcoins: string;
    defi: string;
  };
  riskLevel: 'TINGGI' | 'SEDANG' | 'RENDAH';
  provider: string;
}

interface EventData {
  title: string;
  description: string;
  category: string;
  impact: string;
  country: string;
  currency: string;
  actual?: string;
  forecast?: string;
  previous?: string;
}

class DeepSeekEconomicProvider {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeEconomicEvent(eventData: EventData): Promise<EconomicEventAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(eventData);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `Anda adalah analis ekonomi crypto yang ahli dalam menjelaskan dampak peristiwa ekonomi terhadap cryptocurrency dalam bahasa Indonesia. Berikan analisis yang mendalam, akurat, dan mudah dipahami.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0]?.message?.content;

      if (!analysisText) {
        throw new Error('No analysis received from DeepSeek');
      }

      return this.parseAnalysis(analysisText);
    } catch (error) {
      console.error('DeepSeek economic analysis error:', error);
      throw error;
    }
  }

  private buildAnalysisPrompt(eventData: EventData): string {
    const { title, description, category, impact, country, currency, actual, forecast, previous } = eventData;
    
    return `
Analisis peristiwa ekonomi berikut dan dampaknya terhadap cryptocurrency:

**Detail Event:**
- Judul: ${title}
- Deskripsi: ${description}  
- Kategori: ${category}
- Dampak: ${impact}
- Negara: ${country}
- Mata Uang: ${currency}
${actual ? `- Data Aktual: ${actual}` : ''}
${forecast ? `- Prakiraan: ${forecast}` : ''}
${previous ? `- Data Sebelumnya: ${previous}` : ''}

Berikan analisis dalam format JSON dengan struktur berikut:
{
  "impactScore": <skor 0-100>,
  "direction": "<BULLISH/BEARISH/NEUTRAL>",
  "confidence": <tingkat keyakinan 0-100>,
  "timeframe": "<waktu reaksi pasar>",
  "analysis": "<analisis mendalam dalam bahasa Indonesia>",
  "historicalContext": "<konteks historis dan precedent serupa>",
  "keyFactors": ["<faktor kunci 1>", "<faktor kunci 2>", "<faktor kunci 3>"],
  "cryptoImpact": {
    "bitcoin": "<dampak spesifik ke Bitcoin>",
    "altcoins": "<dampak ke altcoin>",
    "defi": "<dampak ke sektor DeFi>"
  },
  "riskLevel": "<TINGGI/SEDANG/RENDAH>"
}

Fokus pada:
1. Dampak langsung terhadap Bitcoin dan crypto market
2. Konteks makroekonomi yang relevan
3. Historical precedent dan pattern
4. Risk assessment yang realistis
5. Timeframe yang masuk akal untuk reaksi pasar
6. Gunakan bahasa Indonesia yang mudah dipahami
`;
  }

  private parseAnalysis(analysisText: string): EconomicEventAnalysis {
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in analysis');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        impactScore: parsed.impactScore || 50,
        direction: parsed.direction || 'NEUTRAL',
        confidence: parsed.confidence || 70,
        timeframe: parsed.timeframe || '2-6 jam',
        analysis: parsed.analysis || 'Analisis tidak tersedia',
        historicalContext: parsed.historicalContext || 'Konteks historis tidak tersedia',
        keyFactors: parsed.keyFactors || ['Faktor tidak diidentifikasi'],
        cryptoImpact: parsed.cryptoImpact || {
          bitcoin: 'Dampak tidak diketahui',
          altcoins: 'Dampak tidak diketahui',
          defi: 'Dampak tidak diketahui'
        },
        riskLevel: parsed.riskLevel || 'SEDANG',
        provider: 'DeepSeek'
      };
    } catch (error) {
      console.error('Error parsing analysis:', error);
      throw new Error('Failed to parse AI analysis');
    }
  }
}

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Helper function to create event hash
function createEventHash(eventData: EventData): string {
  const eventString = JSON.stringify({
    title: eventData.title,
    description: eventData.description,
    category: eventData.category,
    impact: eventData.impact,
    country: eventData.country,
    currency: eventData.currency,
    actual: eventData.actual || null,
    forecast: eventData.forecast || null,
    previous: eventData.previous || null
  });
  
  return crypto.createHash('sha256').update(eventString).digest('hex');
}

// Helper function to check if cache is valid
function isCacheValid(analyzedAt: Date, expiresAt: Date): boolean {
  const now = new Date();
  return now < expiresAt;
}

export async function POST(request: NextRequest) {
  try {
    // Get DeepSeek API key from environment
    const deepSeekKey = process.env.DEEPSEEK_API_KEY;
    
    if (!deepSeekKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'DeepSeek API key not configured' 
        },
        { status: 500 }
      );
    }

    // Parse request body
    const eventData: EventData = await request.json();
    
    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: title, description, category' 
        },
        { status: 400 }
      );
    }

    // Create hash for this event
    const eventHash = createEventHash(eventData);
    
    console.log('🔍 Checking cache for event:', eventData.title);
    
    // Check cache first
    try {
      const cachedResult = await db
        .select()
        .from(economicAnalysisCache)
        .where(eq(economicAnalysisCache.eventHash, eventHash))
        .limit(1);

      if (cachedResult.length > 0) {
        const cached = cachedResult[0];
        
        // Check if cache is still valid
        if (isCacheValid(cached.analyzedAt, cached.expiresAt)) {
          console.log('✅ Using cached analysis (valid until:', cached.expiresAt.toISOString(), ')');
          
          return NextResponse.json({
            success: true,
            data: cached.analysis,
            cached: true,
            timestamp: cached.analyzedAt.toISOString()
          });
        } else {
          console.log('⏰ Cache expired, will refresh analysis');
          
          // Delete expired cache
          await db
            .delete(economicAnalysisCache)
            .where(eq(economicAnalysisCache.eventHash, eventHash));
        }
      }
    } catch (cacheError) {
      console.warn('⚠️ Cache check failed, proceeding with fresh analysis:', cacheError);
    }

    console.log('🤖 Starting fresh DeepSeek economic analysis for:', eventData.title);

    // Initialize DeepSeek provider and analyze
    const provider = new DeepSeekEconomicProvider(deepSeekKey);
    const analysis = await provider.analyzeEconomicEvent(eventData);

    console.log('✅ DeepSeek economic analysis completed');

    // Cache the result (expire in 24 hours)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    try {
      await db
        .insert(economicAnalysisCache)
        .values({
          eventHash,
          analysis: analysis as any, // Cast to satisfy jsonb type
          eventData: eventData as any,
          analyzedAt: now,
          expiresAt
        })
        .onConflictDoUpdate({
          target: economicAnalysisCache.eventHash,
          set: {
            analysis: analysis as any,
            eventData: eventData as any,
            analyzedAt: now,
            expiresAt
          }
        });
      
      console.log('💾 Analysis cached successfully (expires:', expiresAt.toISOString(), ')');
    } catch (cacheError) {
      console.warn('⚠️ Failed to cache analysis (non-critical):', cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json({
      success: true,
      data: analysis,
      cached: false,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('❌ Economic analysis API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Analysis failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to analyze economic events.' 
    },
    { status: 405 }
  );
}