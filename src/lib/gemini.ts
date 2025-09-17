// Gemini API client for all analytical services
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiAnalytics {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment.');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  // ML Studio - Training Analysis
  async analyzeDatasetForML(csvData: string, config: any) {
    const prompt = `
    Analyze this dataset for machine learning:

    Dataset (first 100 rows):
    ${csvData.split('\n').slice(0, 100).join('\n')}

    Configuration:
    - Problem Type: ${config.problemType}
    - Target Column: ${config.targetColumn}
    - Selected Features: ${config.selectedFeatures.join(', ')}
    - Time Budget: ${config.timeBudget} minutes

    Provide:
    1. Data quality assessment
    2. Feature analysis and recommendations
    3. Suggested algorithms for ${config.problemType}
    4. Expected performance metrics
    5. Potential issues and solutions
    6. Training strategy recommendations

    Format as JSON with keys: quality, features, algorithms, metrics, issues, strategy
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  // ML Studio - Generate Predictions
  async generatePredictions(modelAnalysis: any, inputData: any, problemType: string) {
    const prompt = `
    Based on this trained model analysis:
    ${JSON.stringify(modelAnalysis, null, 2)}

    Make predictions for this input data:
    ${JSON.stringify(inputData, null, 2)}

    Problem type: ${problemType}

    Provide:
    1. Prediction value
    2. Confidence score (0-1)
    3. Reasoning for the prediction
    4. Alternative scenarios
    5. Risk factors

    Format as JSON with keys: prediction, confidence, reasoning, alternatives, risks
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  // Data Connect - Data Analysis
  async analyzeData(csvData: string, analysisType: string) {
    const prompt = `
    Perform ${analysisType} analysis on this dataset:

    Dataset (first 200 rows):
    ${csvData.split('\n').slice(0, 200).join('\n')}

    Provide:
    1. Data overview and summary statistics
    2. Key patterns and trends
    3. Data quality issues
    4. Business insights
    5. Recommendations for improvement
    6. Potential use cases

    Format as JSON with keys: overview, patterns, quality, insights, recommendations, useCases
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  // Forecast Pro - Time Series Forecasting
  async generateForecast(timeSeriesData: any[], forecastPeriods: number) {
    const prompt = `
    Analyze this time series data and generate forecasts:

    Historical Data:
    ${JSON.stringify(timeSeriesData.slice(-50), null, 2)}

    Forecast ${forecastPeriods} periods ahead.

    Provide:
    1. Trend analysis
    2. Seasonal patterns
    3. Forecast values with confidence intervals
    4. Key assumptions
    5. Risk factors
    6. Recommendations

    Format as JSON with keys: trend, seasonality, forecasts, assumptions, risks, recommendations
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  // Recommend Pro - Generate Recommendations
  async generateRecommendations(userProfile: any, itemCatalog: any[], recommendationType: string) {
    const prompt = `
    Generate ${recommendationType} recommendations:

    User Profile:
    ${JSON.stringify(userProfile, null, 2)}

    Item Catalog (sample):
    ${JSON.stringify(itemCatalog.slice(0, 20), null, 2)}

    Provide:
    1. Top 10 recommendations with scores
    2. Reasoning for each recommendation
    3. Alternative recommendations
    4. User segmentation insights
    5. Personalization strategy

    Format as JSON with keys: recommendations, reasoning, alternatives, segmentation, strategy
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  // Segment AI - Customer Segmentation
  async performSegmentation(customerData: any[]) {
    const prompt = `
    Perform customer segmentation analysis:

    Customer Data (sample):
    ${JSON.stringify(customerData.slice(0, 100), null, 2)}

    Provide:
    1. Identified customer segments (3-5 segments)
    2. Segment characteristics and personas
    3. Segment size and value
    4. Targeting strategies for each segment
    5. Marketing recommendations
    6. Retention strategies

    Format as JSON with keys: segments, personas, sizes, targeting, marketing, retention
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  // Dashboard Studio - Generate Visualizations
  async generateDashboardInsights(data: any, dashboardType: string) {
    const prompt = `
    Generate insights for a ${dashboardType} dashboard:

    Data:
    ${JSON.stringify(data, null, 2)}

    Provide:
    1. Key metrics to display
    2. Recommended chart types
    3. Dashboard layout suggestions
    4. Interactive features
    5. Narrative insights
    6. Action items

    Format as JSON with keys: metrics, charts, layout, interactions, narrative, actions
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  // Generic analysis for any service
  async performAnalysis(data: any, analysisType: string, context: string) {
    const prompt = `
    Perform ${analysisType} analysis:

    Context: ${context}
    Data: ${JSON.stringify(data, null, 2)}

    Provide comprehensive analysis with insights, recommendations, and actionable items.
    Format as structured JSON.
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }
}

export const geminiAnalytics = new GeminiAnalytics();
export default GeminiAnalytics;
