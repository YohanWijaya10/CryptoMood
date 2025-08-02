# CryptoMood Features Documentation

## 🔍 Expandable Sentiment Analysis

### Overview
Every news card now includes a "Why?" button that reveals detailed AI analysis explaining the sentiment score.

### How It Works

#### 1. **Collapsed State** (Default)
- Shows basic sentiment (POSITIVE/NEGATIVE/NEUTRAL)
- Displays sentiment score (0-100)
- "Why?" button with info icon
- Analyzed by provider name

#### 2. **Expanded State** (Click "Why?")
- **Detailed AI Analysis Section** with gradient background
- **Main Reasoning** - 2-3 sentence explanation of the analysis
- **Metrics Grid** showing:
  - **Confidence Level** - AI's confidence in the analysis (0-100%)
  - **Market Impact** - Potential impact on Bitcoin price (HIGH/MEDIUM/LOW)
  - **Risk Level** - Investment risk assessment (HIGH/MEDIUM/LOW)
- **Key Factors** - Specific words/phrases that influenced the sentiment
- **Provider Credit** - Which AI provider performed the analysis

### Visual Features

#### Color Coding
- **Bullish (Positive)**: 🟢 Green theme with crypto-green accents
- **Bearish (Negative)**: 🔴 Red theme with crypto-red accents  
- **Neutral**: 🟡 Yellow theme with crypto-yellow accents

#### Interactive Elements
- **Smooth Animation** - Slide-in effect when expanding
- **Icon Changes** - ChevronDown → ChevronUp when expanded
- **Hover Effects** - Button hover states with color transitions
- **Responsive Design** - Works perfectly on mobile and desktop

### AI Analysis Components

#### 1. **Enhanced Reasoning**
- Context-aware explanations
- Market implications
- Regulatory considerations
- Technical development impact

#### 2. **Key Factors Detection**
- Positive keywords: "adoption", "institutional", "growth", "breakthrough"
- Negative keywords: "crash", "ban", "volatility", "restriction"
- Neutral keywords: "analysis", "report", "research"

#### 3. **Market Impact Assessment**
```typescript
HIGH    - Potential significant price movement (3+ key factors)
MEDIUM  - Moderate market influence (1-2 key factors)
LOW     - Minimal immediate impact (general sentiment)
```

#### 4. **Risk Level Analysis**
```typescript
HIGH    - High volatility expected, proceed with caution
MEDIUM  - Normal market risk levels
LOW     - Stable conditions, lower risk indicators
```

### Provider Comparison

#### **DeepSeek API** (Primary)
- **Advanced AI Analysis** - GPT-level understanding
- **Contextual Reasoning** - Considers crypto market dynamics
- **Detailed Explanations** - 2-3 sentence analysis
- **Accurate Scoring** - Trained on financial data
- **Cost Effective** - ~$0.0014 per analysis

#### **Mock Provider** (Fallback)
- **Keyword-Based Analysis** - Rule-based sentiment detection
- **Enhanced Keywords** - 40+ crypto-specific terms
- **Generated Reasoning** - Template-based explanations
- **Reliable Fallback** - Always available, no API key needed
- **Smart Scoring** - Improved algorithm with market context

### Usage Examples

#### Example 1: Positive News
```
Title: "Bitcoin ETF Approval Drives Institutional Adoption"
Sentiment: POSITIVE (Score: 85)

Expanded Analysis:
- Reasoning: "Analysis shows bullish sentiment based on 3 positive indicators: institutional, etf, adoption. This suggests potential upward price movement and positive market reception."
- Key Factors: ["institutional", "etf", "adoption"]
- Market Impact: HIGH
- Risk Level: LOW
- Confidence: 92%
```

#### Example 2: Negative News  
```
Title: "Bitcoin Faces Regulatory Crackdown in Major Market"
Sentiment: NEGATIVE (Score: 25)

Expanded Analysis:
- Reasoning: "Analysis indicates bearish sentiment with 2 negative factors: restriction, ban. This may lead to downward pressure on Bitcoin price and increased market caution."
- Key Factors: ["regulatory", "crackdown", "restriction"]
- Market Impact: HIGH
- Risk Level: HIGH
- Confidence: 88%
```

#### Example 3: Neutral News
```
Title: "Bitcoin Technical Analysis Shows Mixed Signals"
Sentiment: NEUTRAL (Score: 52)

Expanded Analysis:
- Reasoning: "Neutral sentiment detected with balanced indicators. Key factors: analysis, mixed signals. Market impact likely minimal in short term."
- Key Factors: ["analysis", "technical", "signals"]
- Market Impact: LOW
- Risk Level: MEDIUM
- Confidence: 75%
```

### Benefits for Users

#### **Better Decision Making**
- Understand WHY a news item has a specific sentiment score
- See which specific words/phrases influenced the analysis
- Assess potential market impact before making investment decisions

#### **Transparency**
- Full visibility into AI reasoning process
- No "black box" sentiment scoring
- Clear methodology explanation

#### **Risk Assessment**
- Built-in risk level indicators
- Market impact predictions
- Confidence levels for each analysis

#### **Educational Value**
- Learn which factors influence Bitcoin sentiment
- Understand market psychology
- Improve personal analysis skills

### Technical Implementation

#### **Component Structure**
```tsx
NewsCard
├── Sentiment Header (always visible)
│   ├── Sentiment Badge (🟢 POSITIVE)
│   ├── Score Display (Score: 75/100)
│   └── Expand Button ("Why?" + icon)
├── News Content (title + description)
├── Expandable Analysis (conditional)
│   ├── Analysis Header with icon
│   ├── Main Reasoning paragraph
│   ├── Metrics Grid (3 columns)
│   ├── Key Factors chips
│   └── Provider Credit
└── Footer (Read more link)
```

#### **State Management**
```tsx
const [isExpanded, setIsExpanded] = useState(false);
```

#### **Animation Classes**
```css
animate-in slide-in-from-top-2 duration-200
```

This feature significantly enhances the user experience by providing transparency, educational value, and actionable insights for Bitcoin sentiment analysis.