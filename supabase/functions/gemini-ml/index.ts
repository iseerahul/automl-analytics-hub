// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request data
    const { dataset, taskType, targetColumn, useCase, modelConfig } = await req.json();

    // Construct prompt for Gemini
    const prompt = `You are an AI data scientist. Analyze this dataset and provide insights and predictions.
    
    Task Type: ${taskType}
    Use Case: ${useCase}
    Target Column: ${targetColumn}
    
    Dataset Details:
    Name: ${dataset.name}
    Rows: ${dataset.rows}
    Columns: ${dataset.columns}
    
    Please provide:
    1. Data Analysis: Analyze the key patterns and relationships in the data
    2. Predictions: What are the likely outcomes based on the data?
    3. Insights: What are the key findings and patterns?
    4. Recommendations: What actions should be taken based on this analysis?
    
    Dataset Sample:
    ${JSON.stringify(dataset.data?.slice(0, 5) || dataset).slice(0, 1000)}`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${Deno.env.get('VITE_GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const geminiResponse = await response.json();
    
    // Extract the analysis from Gemini's response
    const analysisText = geminiResponse.candidates[0].content.parts[0].text;

    // Format the response
    const result = {
      predictions: analysisText.split('Predictions:')[1]?.split('Insights:')[0]?.trim() || analysisText,
      insights: analysisText.split('Insights:')[1]?.split('Recommendations:')[0]?.trim() || '',
      recommendations: analysisText.split('Recommendations:')[1]?.trim() || '',
      fullAnalysis: analysisText
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        status: 'error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
