// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Log request received
    console.log('Request received');

    // Get request data
    const { datasetId, taskType, targetColumn, useCase } = await req.json();
    console.log('Request data:', { datasetId, taskType, targetColumn, useCase });

    // Validate required fields
    if (!datasetId || !taskType) {
      throw new Error('Missing required fields: datasetId and taskType are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch dataset
    console.log('Fetching dataset:', datasetId);
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single();

    if (datasetError || !dataset) {
      console.error('Dataset fetch error:', datasetError);
      throw new Error(`Failed to fetch dataset: ${datasetError?.message || 'Dataset not found'}`);
    }

    console.log('Dataset fetched successfully');

    // Construct prompt for Gemini
    const prompt = `You are an AI data scientist. Analyze this dataset and provide insights and predictions.
    
    Task Type: ${taskType}
    Use Case: ${useCase || 'General Analysis'}
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
    ${JSON.stringify(dataset.data?.slice(0, 5) || dataset)}`;

    // Check Gemini API key
    const geminiApiKey = Deno.env.get('VITE_GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Missing Gemini API key');
    }

    console.log('Calling Gemini API...');
    
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
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
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const geminiResponse = await response.json();
    console.log('Gemini response received');

    if (!geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const analysisText = geminiResponse.candidates[0].content.parts[0].text;

    // Store result in database
    const { error: insertError } = await supabase
      .from('ml_results')
      .insert([{
        dataset_id: datasetId,
        task_type: taskType,
        result: {
          predictions: analysisText.split('Predictions:')[1]?.split('Insights:')[0]?.trim() || analysisText,
          insights: analysisText.split('Insights:')[1]?.split('Recommendations:')[0]?.trim() || '',
          recommendations: analysisText.split('Recommendations:')[1]?.trim() || '',
          fullAnalysis: analysisText
        },
        created_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.error('Result storage error:', insertError);
    }

    // Return response
    return new Response(
      JSON.stringify({
        predictions: analysisText.split('Predictions:')[1]?.split('Insights:')[0]?.trim() || analysisText,
        insights: analysisText.split('Insights:')[1]?.split('Recommendations:')[0]?.trim() || '',
        recommendations: analysisText.split('Recommendations:')[1]?.trim() || '',
        fullAnalysis: analysisText
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
