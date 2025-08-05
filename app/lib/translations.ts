export const translations = {
  en: {
    // NavBar
    analysisActive: 'Analysis Active',
    idle: 'Idle',
    
    // Dashboard
    bitcoinMarketSentiment: 'Bitcoin Market Sentiment',
    realTimeSentimentAnalysis: 'Real-time sentiment analysis',
    neuralAnalysisOf: 'Neural analysis of',
    articles: 'articles',
    latestBitcoinNews: 'Latest Bitcoin News',
    aiPoweredSentimentAnalysis: 'AI-powered sentiment analysis on',
    analyzedBy: 'Analyzed by',
    
    // Sentiment Labels
    bullish: 'Bullish',
    bearish: 'Bearish',
    neutral: 'Neutral',
    positive: 'POSITIVE',
    negative: 'NEGATIVE',
    
    // Sentiment Levels
    extremely: 'Extremely',
    very: 'Very',
    moderately: 'Moderately',
    slightly: 'Slightly',
    
    // Market Impact
    marketSentiment: 'Market Sentiment',
    
    // Loading & Error
    analyzingBitcoinSentiment: 'Analyzing Bitcoin Sentiment',
    fetchingLatestNews: 'Fetching latest news and analyzing market sentiment with AI...',
    unableToLoadData: 'Unable to Load Data',
    tryAgain: 'Try Again',
    
    // Footer
    professionalBitcoinSentiment: 'Professional Bitcoin sentiment analysis platform providing real-time market intelligence through advanced AI technology.',
    dataSources: 'Data Sources',
    allRightsReserved: 'All rights reserved.',
    liveAnalysisActive: 'Live Analysis Active',
    
    // News
    noBitcoinNewsFound: 'No Bitcoin News Found',
    noRecentArticles: 'No recent Bitcoin-related news articles available for analysis. Please try refreshing or check back later.',
  },
  
  id: {
    // NavBar
    analysisActive: 'Analisis Aktif',
    idle: 'Siaga',
    
    // Dashboard
    bitcoinMarketSentiment: 'Sentimen Pasar Bitcoin',
    realTimeSentimentAnalysis: 'Analisis sentimen real-time',
    neuralAnalysisOf: 'Analisis neural dari',
    articles: 'artikel',
    latestBitcoinNews: 'Berita Bitcoin Terbaru',
    aiPoweredSentimentAnalysis: 'Analisis sentimen bertenaga AI pada',
    analyzedBy: 'Dianalisis oleh',
    
    // Sentiment Labels
    bullish: 'Bullish',
    bearish: 'Bearish',
    neutral: 'Netral',
    positive: 'POSITIF',
    negative: 'NEGATIF',
    
    // Sentiment Levels
    extremely: 'Sangat',
    very: 'Sangat',
    moderately: 'Cukup',
    slightly: 'Sedikit',
    
    // Market Impact
    marketSentiment: 'Sentimen Pasar',
    
    // Loading & Error
    analyzingBitcoinSentiment: 'Menganalisis Sentimen Bitcoin',
    fetchingLatestNews: 'Mengambil berita terbaru dan menganalisis sentimen pasar dengan AI...',
    unableToLoadData: 'Tidak Dapat Memuat Data',
    tryAgain: 'Coba Lagi',
    
    // Footer
    professionalBitcoinSentiment: 'Platform analisis sentimen Bitcoin profesional yang menyediakan intelijen pasar real-time melalui teknologi AI canggih.',
    dataSources: 'Sumber Data',
    allRightsReserved: 'Semua hak dilindungi.',
    liveAnalysisActive: 'Analisis Live Aktif',
    
    // News
    noBitcoinNewsFound: 'Tidak Ada Berita Bitcoin',
    noRecentArticles: 'Tidak ada artikel berita terkait Bitcoin terbaru tersedia untuk analisis. Silakan coba refresh atau periksa lagi nanti.',
  }
};

export function useTranslations(language: 'en' | 'id') {
  return translations[language];
}