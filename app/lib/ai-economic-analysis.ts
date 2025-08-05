export interface EconomicEventAnalysis {
  impactScore: number; // 0-100
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number; // 0-100
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

interface AIProvider {
  analyzeEconomicEvent(eventData: {
    title: string;
    description: string;
    category: string;
    impact: string;
    country: string;
    currency: string;
    actual?: string;
    forecast?: string;
    previous?: string;
  }): Promise<EconomicEventAnalysis>;
}

class DeepSeekEconomicProvider implements AIProvider {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeEconomicEvent(eventData: any): Promise<EconomicEventAnalysis> {
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

  private buildAnalysisPrompt(eventData: any): string {
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

class MockEconomicProvider implements AIProvider {
  async analyzeEconomicEvent(eventData: any): Promise<EconomicEventAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const { title, category, impact, country } = eventData;
    
    // Generate mock analysis based on event characteristics
    const mockAnalyses = this.getMockAnalysisByCategory(category, impact, title);
    
    return {
      ...mockAnalyses,
      provider: 'Mock Provider'
    };
  }

  private getMockAnalysisByCategory(category: string, impact: string, title: string): Omit<EconomicEventAnalysis, 'provider'> {
    const baseAnalyses: Record<string, any> = {
      'INTEREST_RATE': {
        impactScore: 85,
        direction: 'BULLISH' as const,
        confidence: 88,
        timeframe: '2-6 jam',
        analysis: 'Keputusan suku bunga Federal Reserve sangat berpengaruh terhadap pasar crypto. Penurunan suku bunga cenderung mendorong investor mencari yield yang lebih tinggi di aset berisiko seperti Bitcoin dan altcoin.',
        historicalContext: 'Berdasarkan data historis, penurunan suku bunga Fed dalam 3 tahun terakhir menyebabkan kenaikan rata-rata 12-18% pada Bitcoin dalam 48 jam. Kasus serupa terjadi pada Maret 2020 dan Juli 2019.',
        keyFactors: ['Kebijakan moneter dovish', 'Pencarian yield tinggi', 'Sentiment risk-on institutional'],
        cryptoImpact: {
          bitcoin: 'Kemungkinan rally 10-15% dalam 24 jam pertama, dengan potensi lanjutan hingga 25% dalam minggu ini',
          altcoins: 'Outperform Bitcoin dengan gain 15-30%, terutama di sektor DeFi dan layer-1',
          defi: 'Sektor paling diuntungkan karena yield farming menjadi lebih menarik dibanding obligasi tradisional'
        },
        riskLevel: 'SEDANG' as const
      },
      'INFLATION': {
        impactScore: 78,
        direction: 'BULLISH' as const,
        confidence: 82,
        timeframe: '1-4 jam',
        analysis: 'Data inflasi CPI yang lebih rendah dari ekspektasi menguatkan narasi bahwa Fed akan mulai memotong suku bunga. Hal ini positif untuk aset berisiko termasuk cryptocurrency sebagai hedge terhadap inflasi.',
        historicalContext: 'CPI di bawah ekspektasi secara konsisten memicu rally crypto dalam 6 bulan terakhir. Rata-rata kenaikan Bitcoin 8-12% dalam 24 jam pasca-rilis data inflasi yang mengejutkan ke bawah.',
        keyFactors: ['Ekspektasi pemotongan suku bunga', 'Narrative bitcoin sebagai inflation hedge', 'Risk appetite institutional meningkat'],
        cryptoImpact: {
          bitcoin: 'Target jangka pendek $45,000-$48,000 dalam 2-3 hari trading',
          altcoins: 'Rotasi dana dari Bitcoin ke altcoin caps besar, dengan fokus pada Ethereum dan Solana',
          defi: 'TVL diperkirakan naik 5-10% karena increased appetite untuk yield farming'
        },
        riskLevel: 'RENDAH' as const
      },
      'EMPLOYMENT': {
        impactScore: 65,
        direction: 'NEUTRAL' as const,
        confidence: 75,
        timeframe: '30 menit - 2 jam',
        analysis: 'Data ketenagakerjaan memiliki dampak tidak langsung terhadap crypto. Jika data employment strong, Fed mungkin maintain hawkish stance yang negatif untuk crypto. Sebaliknya, data lemah bisa trigger dovish pivot.',
        historicalContext: 'Non-Farm Payrolls yang mengejutkan (baik ke atas atau bawah) biasanya menyebabkan volatilitas tinggi di crypto dalam 2 jam pertama. Dampak jangka menengah tergantung interpretasi Fed terhadap data.',
        keyFactors: ['Kebijakan Fed forward guidance', 'Labor market tightness', 'Wage inflation pressure'],
        cryptoImpact: {
          bitcoin: 'Volatilitas tinggi dalam 2 jam pertama, range $1,000-$2,000',
          altcoins: 'Follow Bitcoin dengan amplified volatility, especially micro-caps',
          defi: 'Minimal direct impact, lebih terpengaruh oleh overall crypto sentiment'
        },
        riskLevel: 'SEDANG' as const
      }
    };

    // Get base analysis or fallback to generic
    const baseAnalysis = baseAnalyses[category] || {
      impactScore: 60,
      direction: 'NEUTRAL' as const,
      confidence: 70,
      timeframe: '1-3 jam',
      analysis: `Event ${title} memiliki dampak moderat terhadap pasar cryptocurrency. Perlu monitoring reaction dari institutional investors dan correlation dengan traditional markets.`,
      historicalContext: 'Event serupa di masa lalu menunjukkan dampak mixed terhadap crypto market, tergantung pada kondisi makroekonomi saat itu.',
      keyFactors: ['Market sentiment', 'Volume trading', 'Correlation dengan stock market'],
      cryptoImpact: {
        bitcoin: 'Dampak terbatas, kemungkinan trading range normal',
        altcoins: 'Follow Bitcoin dengan correlation tinggi',
        defi: 'Minimal impact pada TVL dan yields'
      },
      riskLevel: 'SEDANG' as const
    };

    // Adjust based on impact level
    if (impact === 'HIGH') {
      baseAnalysis.impactScore = Math.min(95, baseAnalysis.impactScore + 20);
      baseAnalysis.confidence = Math.min(95, baseAnalysis.confidence + 10);
    } else if (impact === 'LOW') {
      baseAnalysis.impactScore = Math.max(20, baseAnalysis.impactScore - 25);
      baseAnalysis.confidence = Math.max(50, baseAnalysis.confidence - 15);
    }

    return baseAnalysis;
  }
}

class EconomicEventAnalyzer {
  private providers: AIProvider[] = [];
  private initialized = false;

  constructor() {
    // Don't initialize in constructor - do it lazily on first use
  }

  private async initializeProviders(): Promise<void> {
    if (this.initialized) return;

    try {
      // Call API endpoint to get analysis (server-side will handle DeepSeek)
      this.initialized = true;
      console.log('🚀 Economic analyzer initialized');
    } catch (error) {
      console.error('❌ Failed to initialize economic analyzer:', error);
      throw error;
    }
  }

  async analyzeEvent(eventData: {
    title: string;
    description: string;
    category: string;
    impact: string;
    country: string;
    currency: string;
    actual?: string;
    forecast?: string;
    previous?: string;
  }): Promise<EconomicEventAnalysis> {
    await this.initializeProviders();

    try {
      console.log('🤖 Analyzing economic event with DeepSeek API...');
      
      // Call our API endpoint which handles DeepSeek on server-side
      const response = await fetch('/api/economic-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const analysis = await response.json();
      
      if (!analysis.success) {
        throw new Error(analysis.error || 'Analysis failed');
      }

      console.log('✅ Economic analysis completed by DeepSeek');
      return analysis.data;
      
    } catch (error) {
      console.error('❌ Economic analysis failed:', error);
      throw error;
    }
  }

  // Get available providers for debugging
  getAvailableProviders(): string[] {
    return this.providers.map(p => p.constructor.name);
  }
}

export const economicEventAnalyzer = new EconomicEventAnalyzer();