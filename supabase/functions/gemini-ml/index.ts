// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

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
    const { datasetId, taskType, targetColumn, useCase } = await req.json();

    if (!datasetId || !taskType) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', // Changed to use service role key
    );

    // Fetch dataset with error handling
    const { data: dataset, error: datasetError } = await supabaseClient
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single();

    if (datasetError || !dataset) {
      throw new Error(`Failed to fetch dataset: ${datasetError?.message || 'Dataset not found'}`);
    }

    // Log fetched dataset details
    console.log('Dataset fetched:', {
      id: dataset.id,
      name: dataset.name,
      columns: dataset.columns,
      hasData: !!dataset.data
    });

    // Construct Gemini prompt
    const prompt = `You are an AI assistant performing ${taskType} analysis.
    Task: Analyze this dataset for ${useCase} use case.
    Target Column: ${targetColumn}
    Dataset Details:
    - Name: ${dataset.name}
    - Rows: ${dataset.rows}
    - Columns: ${dataset.columns}
    
    Please provide:
    1. Initial data analysis
    2. Key insights
    3. Predictions or patterns found
    4. Recommendations
    
    Sample Data: ${JSON.stringify(dataset.data?.slice(0, 5) || dataset).slice(0, 1000)}`;  // Limit data size

    // Log prompt length
    console.log('Calling Gemini API with prompt length:', prompt.length);

    // Call Gemini API with error handling
    const geminiResponse = await fetch(
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

    // Log Gemini response status
    console.log('Gemini response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const geminiResult = await geminiResponse.json();

    if (!geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    // Process and structure the response
    const analysisText = geminiResult.candidates[0].content.parts[0].text;
    const result = {
      predictions: analysisText,
      insights: analysisText,
      status: 'success',
      timestamp: new Date().toISOString()
    };

    // Store the result in Supabase
    const { error: insertError } = await supabaseClient
      .from('ml_results')
      .insert([{
        dataset_id: datasetId,
        task_type: taskType,
        result: result,
        created_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.error('Failed to store results:', insertError);
      // Continue anyway - don't fail the request
    }

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
    return sendError(error.message);
  }
});

const sendError = (message: string, status = 400) => {
  console.error('Error:', message);
  return new Response(
    JSON.stringify({
      error: message,
      status: 'error',
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
};

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_GEMINI_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!Deno.env.get(envVar)) {
    return sendError(`Missing required environment variable: ${envVar}`, 500);
  }
}
