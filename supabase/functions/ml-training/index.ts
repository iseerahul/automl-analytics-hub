import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
          selected_features: config.selectedFeatures,
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

      // Start background training simulation
      EdgeRuntime.waitUntil(simulateTraining(supabaseClient, job.id));

      return new Response(JSON.stringify({ 
        success: true, 
        jobId: job.id,
        message: 'Training started successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get-jobs') {
      // Fetch jobs first, then enrich with dataset info in a separate query
      const { data: jobs, error: jobsError } = await supabaseClient
        .from('ml_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Build a map of datasets for the jobs
      const datasetIds = Array.from(new Set((jobs || []).map((j: any) => j.dataset_id).filter(Boolean)));
      let datasetsMap: Record<string, { id: string; name: string; source: string }> = {};

      if (datasetIds.length > 0) {
        const { data: datasets, error: dsError } = await supabaseClient
          .from('datasets')
          .select('id, name, source')
          .in('id', datasetIds);
        if (dsError) throw dsError;
        (datasets || []).forEach((d: any) => { datasetsMap[d.id] = d; });
      }

      const enrichedJobs = (jobs || []).map((j: any) => ({
        ...j,
        datasets: datasetsMap[j.dataset_id]
          ? { name: datasetsMap[j.dataset_id].name, source: datasetsMap[j.dataset_id].source }
          : null
      }));

      return new Response(JSON.stringify({ jobs: enrichedJobs }), {
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

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('ML Training error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Simulate ML training process
async function simulateTraining(supabaseClient: any, jobId: string) {
  try {
    const totalSteps = 100;
    const trainingHistory = [];
    
    for (let step = 1; step <= totalSteps; step++) {
      // Simulate training progress
      const progress = Math.floor((step / totalSteps) * 100);
      const accuracy = Math.min(0.6 + (step / totalSteps) * 0.35 + Math.random() * 0.05, 0.95);
      const loss = Math.max(0.8 - (step / totalSteps) * 0.6 - Math.random() * 0.1, 0.05);
      
      trainingHistory.push({
        epoch: step,
        accuracy: accuracy,
        loss: loss,
        timestamp: new Date().toISOString()
      });

      // Update job progress every 10 steps
      if (step % 10 === 0) {
        await supabaseClient
          .from('ml_jobs')
          .update({
            progress: progress,
            accuracy: accuracy,
            metrics: { current_loss: loss }
          })
          .eq('id', jobId);
      }

      // Simulate training time
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Mark job as completed
    const finalAccuracy = trainingHistory[trainingHistory.length - 1].accuracy;
    await supabaseClient
      .from('ml_jobs')
      .update({
        status: 'completed',
        progress: 100,
        accuracy: finalAccuracy,
        completed_at: new Date().toISOString(),
        metrics: {
          final_accuracy: finalAccuracy,
          training_time_seconds: totalSteps * 0.2,
          epochs: totalSteps
        }
      })
      .eq('id', jobId);

    // Create model record
    await supabaseClient
      .from('ml_models')
      .insert({
        user_id: (await supabaseClient.from('ml_jobs').select('user_id').eq('id', jobId).single()).data.user_id,
        job_id: jobId,
        name: `Model_${jobId.slice(0, 8)}`,
        model_type: 'AutoML',
        metrics: {
          accuracy: finalAccuracy,
          precision: Math.min(finalAccuracy + 0.02, 0.95),
          recall: Math.min(finalAccuracy - 0.01, 0.93),
          f1_score: Math.min(finalAccuracy + 0.01, 0.94)
        },
        training_history: trainingHistory,
        status: 'ready'
      });

    console.log(`Training completed for job ${jobId}`);
  } catch (error) {
    console.error('Training simulation error:', error);
    // Mark job as failed
    await supabaseClient
      .from('ml_jobs')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', jobId);
  }
}