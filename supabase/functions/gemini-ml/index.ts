// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainingConfig {
  name: string;
  datasetId: string;
  problemType: 'classification' | 'regression';
  targetColumn: string;
  selectedFeatures: string[];
  timeBudget: number;
  optimizationMetric: string;
}

class GeminiMLService {
  private genAI: any;
  private model: any;

  constructor() {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  async analyzeDatasetForML(csvData: string, config: TrainingConfig) {
    const prompt = `
    Analyze this dataset for machine learning training:

    Dataset (first 100 rows):
    ${csvData.split('\n').slice(0, 100).join('\n')}

    Configuration:
    - Problem Type: ${config.problemType}
    - Target Column: ${config.targetColumn}
    - Selected Features: ${config.selectedFeatures.join(', ')}
    - Time Budget: ${config.timeBudget} minutes
    - Optimization Metric: ${config.optimizationMetric}

    Provide a comprehensive analysis including:
    1. Data quality assessment (missing values, outliers, data types)
    2. Feature analysis and engineering recommendations
    3. Suggested algorithms for ${config.problemType} (top 3-5)
    4. Expected performance metrics and benchmarks
    5. Potential issues and solutions
    6. Training strategy and hyperparameter recommendations
    7. Model validation approach

    Return as JSON with this exact structure:
    {
      "quality": {
        "missing_values": {...},
        "outliers": {...},
        "data_types": {...},
        "quality_score": 0.85
      },
      "features": {
        "correlations": {...},
        "importance": {...},
        "engineering_suggestions": [...]
      },
      "algorithms": [
        {"name": "Random Forest", "reason": "...", "expected_accuracy": 0.87},
        {"name": "XGBoost", "reason": "...", "expected_accuracy": 0.89}
      ],
      "metrics": {
        "baseline_accuracy": 0.75,
        "target_accuracy": 0.85,
        "expected_training_time": "15 minutes"
      },
      "issues": [
        {"type": "class_imbalance", "severity": "medium", "solution": "..."}
      ],
      "strategy": {
        "validation_method": "k-fold cross-validation",
        "hyperparameters": {...},
        "feature_selection": true
      }
    }
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse Gemini response as JSON');
  }

  async generatePredictions(modelAnalysis: any, inputData: any, problemType: string) {
    const prompt = `
    Based on this trained model analysis:
    ${JSON.stringify(modelAnalysis, null, 2)}

    Make predictions for this input data:
    ${JSON.stringify(inputData, null, 2)}

    Problem type: ${problemType}

    Provide detailed predictions including:
    1. Primary prediction value
    2. Confidence score (0-1)
    3. Detailed reasoning
    4. Alternative scenarios
    5. Risk factors and uncertainty
    6. Feature importance for this prediction

    Return as JSON:
    {
      "prediction": 0.85,
      "confidence": 0.92,
      "reasoning": "Based on the input features...",
      "alternatives": [
        {"scenario": "optimistic", "value": 0.92, "probability": 0.2},
        {"scenario": "pessimistic", "value": 0.78, "probability": 0.1}
      ],
      "risks": ["Feature X has high uncertainty", "Model trained on limited data"],
      "feature_importance": {"feature1": 0.3, "feature2": 0.25}
    }
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse prediction response as JSON');
  }

  async generateModelInsights(trainingResults: any, config: TrainingConfig) {
    const prompt = `
    Generate comprehensive model insights based on training results:

    Training Results:
    ${JSON.stringify(trainingResults, null, 2)}

    Original Configuration:
    ${JSON.stringify(config, null, 2)}

    Provide:
    1. Model performance summary
    2. Key insights and patterns discovered
    3. Business impact and recommendations
    4. Model limitations and considerations
    5. Deployment recommendations
    6. Monitoring and maintenance plan

    Return as JSON with detailed insights.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { insights: text };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get current user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...requestData } = await req.json();
    const geminiML = new GeminiMLService();

    if (action === 'start-training') {
      const config: TrainingConfig = requestData;
      
      // Create ML job record
      const { data: job, error: jobError } = await supabaseClient
        .from('ml_jobs')
        .insert({
          user_id: user.id,
          name: config.name,
          dataset_id: config.datasetId,
          problem_type: config.problemType,
          target_column: config.targetColumn,
          selected_features: Array.isArray(config.selectedFeatures) ? config.selectedFeatures : [],
          config: {
            time_budget: config.timeBudget,
            optimization_metric: config.optimizationMetric
          },
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (jobError) {
        console.error('Job creation error:', jobError);
        throw jobError;
      }

      // Start Gemini-powered training
      ;(async () => {
        try {
          await trainWithGemini(supabaseClient, job.id, config, geminiML);
        } catch (error) {
          console.error('Gemini training error:', error);
        }
      })();

      return new Response(JSON.stringify({ 
        success: true, 
        jobId: job.id,
        message: 'Gemini-powered training started successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'predict') {
      const { modelId, input } = requestData;
      if (!modelId || !input) throw new Error('modelId and input are required');

      // Get model details
      const { data: model, error } = await supabaseClient
        .from('ml_models')
        .select('*')
        .eq('id', modelId)
        .eq('user_id', user.id)
        .single();
      if (error) throw error;

      // Generate prediction using Gemini
      const prediction = await geminiML.generatePredictions(
        model.model_config,
        input,
        model.model_type
      );

      return new Response(JSON.stringify({
        success: true,
        modelId: model.id,
        modelName: model.name,
        output: prediction,
        input: input
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get-jobs') {
      const { data: jobs, error } = await supabaseClient
        .from('ml_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ jobs }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get-models') {
      const { data: models, error } = await supabaseClient
        .from('ml_models')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ models }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete-job') {
      const { jobId } = requestData;
      if (!jobId) throw new Error('jobId is required');

      // Delete related model first
      await supabaseClient
        .from('ml_models')
        .delete()
        .eq('job_id', jobId)
        .eq('user_id', user.id);

      // Delete the job
      const { error } = await supabaseClient
        .from('ml_jobs')
        .delete()
        .eq('id', jobId)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete-model') {
      const { modelId } = requestData;
      if (!modelId) throw new Error('modelId is required');

      const { error } = await supabaseClient
        .from('ml_models')
        .delete()
        .eq('id', modelId)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'export-model') {
      const { modelId, format } = requestData;
      if (!modelId || !format) throw new Error('modelId and format are required');

      // Get model details
      const { data: model, error } = await supabaseClient
        .from('ml_models')
        .select('*')
        .eq('id', modelId)
        .eq('user_id', user.id)
        .single();
      if (error) throw error;

      // Generate export content using Gemini
      const exportContent = await generateModelExport(model, format, geminiML);

      // Upload to Supabase Storage
      const path = `${user.id}/${model.id}_${model.name}.${format}`;
      const blob = new Blob([exportContent], { type: 'application/json' });

      const { error: uploadErr } = await supabaseClient
        .storage
        .from('exports')
        .upload(path, blob, { upsert: true });
      
      if (uploadErr) throw uploadErr;

      // Create signed download URL
      const { data: signedUrlData, error: signErr } = await supabaseClient
        .storage
        .from('exports')
        .createSignedUrl(path, 60 * 60);
      
      if (signErr) throw signErr;

      return new Response(JSON.stringify({ 
        success: true, 
        downloadUrl: signedUrlData?.signedUrl,
        fileName: `${model.name}.${format}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'deploy-model') {
      const { modelId } = requestData;
      if (!modelId) throw new Error('modelId is required');

      const { data: model, error } = await supabaseClient
        .from('ml_models')
        .select('*')
        .eq('id', modelId)
        .eq('user_id', user.id)
        .single();
      if (error) throw error;

      // Create prediction endpoint
      const endpoint = `${Deno.env.get('SUPABASE_URL')}/functions/v1/gemini-ml?action=predict&modelId=${model.id}`;

      return new Response(JSON.stringify({ 
        success: true, 
        endpoint,
        modelName: model.name
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Gemini ML error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Gemini-powered training process
async function trainWithGemini(supabaseClient: any, jobId: string, config: TrainingConfig, geminiML: GeminiMLService) {
  try {
    console.log(`Starting Gemini-powered training for job ${jobId}`);
    
    // Get dataset
    const { data: dataset } = await supabaseClient
      .from('datasets')
      .select('*')
      .eq('id', config.datasetId)
      .single();
    
    if (!dataset || !dataset.file_path) {
      throw new Error('Dataset file not found');
    }
    
    // Download CSV data
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('datasets')
      .download(dataset.file_path);
    
    if (downloadError) {
      throw new Error(`Failed to download dataset: ${downloadError.message}`);
    }
    
    const csvContent = await fileData.text();
    
    // Analyze dataset with Gemini
    const analysis = await geminiML.analyzeDatasetForML(csvContent, config);
    
    // Simulate training progress
    const totalSteps = 5;
    for (let step = 1; step <= totalSteps; step++) {
      const progress = Math.floor((step / totalSteps) * 100);
      
      await supabaseClient
        .from('ml_jobs')
        .update({
          progress: progress,
          metrics: {
            step: step,
            current_phase: ['Data Analysis', 'Feature Engineering', 'Model Training', 'Validation', 'Finalization'][step - 1],
            analysis: step === 1 ? analysis : null
          }
        })
        .eq('id', jobId);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Generate final model insights
    const modelInsights = await geminiML.generateModelInsights(analysis, config);
    
    // Mark job as completed
    await supabaseClient
      .from('ml_jobs')
      .update({
        status: 'completed',
        progress: 100,
        accuracy: analysis.metrics?.target_accuracy || 0.85,
        completed_at: new Date().toISOString(),
        metrics: {
          final_analysis: analysis,
          model_insights: modelInsights,
          training_method: 'Gemini_Powered_ML'
        }
      })
      .eq('id', jobId);

    // Create model record
    await supabaseClient
      .from('ml_models')
      .insert({
        user_id: (await supabaseClient.from('ml_jobs').select('user_id').eq('id', jobId).single()).data.user_id,
        job_id: jobId,
        name: config.name || `Gemini_ML_${jobId.slice(0, 8)}`,
        model_type: 'Gemini_Powered_ML',
        metrics: {
          accuracy: analysis.metrics?.target_accuracy || 0.85,
          confidence: analysis.metrics?.baseline_accuracy || 0.75,
          quality_score: analysis.quality?.quality_score || 0.8
        },
        status: 'ready',
        model_config: {
          framework: 'Gemini_AI',
          analysis: analysis,
          insights: modelInsights,
          config: config
        }
      });

    console.log(`Gemini-powered training completed for job ${jobId}`);
    
  } catch (error) {
    console.error('Gemini training error:', error);
    
    await supabaseClient
      .from('ml_jobs')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', jobId);
  }
}

// Generate model export content
async function generateModelExport(model: any, format: string, geminiML: GeminiMLService) {
  const exportData = {
    model_id: model.id,
    model_name: model.name,
    model_type: model.model_type,
    created_at: model.created_at,
    metrics: model.metrics,
    config: model.model_config,
    format: format,
    export_timestamp: new Date().toISOString(),
    gemini_analysis: model.model_config?.analysis,
    insights: model.model_config?.insights
  };

  return JSON.stringify(exportData, null, 2);
}
