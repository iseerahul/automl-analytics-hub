-- Create ML jobs table for tracking training tasks
CREATE TABLE public.ml_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dataset_id UUID NOT NULL,
  problem_type TEXT NOT NULL CHECK (problem_type IN ('classification', 'regression')),
  target_column TEXT NOT NULL,
  selected_features TEXT[] NOT NULL DEFAULT '{}',
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  accuracy DECIMAL,
  metrics JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ml_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for ML jobs
CREATE POLICY "Users can view their own ML jobs" 
ON public.ml_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ML jobs" 
ON public.ml_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ML jobs" 
ON public.ml_jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ML jobs" 
ON public.ml_jobs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_ml_jobs_updated_at
BEFORE UPDATE ON public.ml_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create ML models table for storing trained models
CREATE TABLE public.ml_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID NOT NULL,
  name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  feature_importance JSONB,
  model_config JSONB NOT NULL DEFAULT '{}',
  training_history JSONB,
  status TEXT NOT NULL DEFAULT 'training' CHECK (status IN ('training', 'ready', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for models
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;

-- Create policies for ML models
CREATE POLICY "Users can view their own ML models" 
ON public.ml_models 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ML models" 
ON public.ml_models 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ML models" 
ON public.ml_models 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_ml_models_updated_at
BEFORE UPDATE ON public.ml_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();