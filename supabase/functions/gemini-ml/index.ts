// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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
    const { action, datasetId, taskType, targetColumn, useCase } = await req.json();

    if (action !== 'analyze') {
      throw new Error('Invalid action');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fetch dataset
    const { data: dataset, error: datasetError } = await supabaseClient
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single();

    if (datasetError) throw datasetError;

    // Call Gemini API
    const prompt = `Analyze this dataset for ${taskType} task targeting ${targetColumn} column for ${useCase} use case. 
                   Provide predictions and insights.
                   Dataset: ${JSON.stringify(dataset)}`;

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

    const geminiResult = await response.json();

    // Process Gemini's response
    const result = {
      predictions: geminiResult.predictions || geminiResult.candidates[0].content.parts[0].text,
      insights: geminiResult.insights || "Analysis complete"
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
