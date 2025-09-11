-- Create datasets table for DataConnect
CREATE TABLE public.datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  file_path TEXT,
  rows INTEGER DEFAULT 0,
  columns INTEGER DEFAULT 0,
  size_bytes BIGINT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own datasets" 
ON public.datasets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own datasets" 
ON public.datasets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets" 
ON public.datasets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets" 
ON public.datasets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_datasets_updated_at
BEFORE UPDATE ON public.datasets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for dataset files
INSERT INTO storage.buckets (id, name, public) VALUES ('datasets', 'datasets', false);

-- Create storage policies for dataset uploads
CREATE POLICY "Users can view their own dataset files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own dataset files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own dataset files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own dataset files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create data connectors table for external connections
CREATE TABLE public.data_connectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('s3', 'google_sheets', 'bigquery', 'postgresql', 'mysql')),
  config JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for data connectors
ALTER TABLE public.data_connectors ENABLE ROW LEVEL SECURITY;

-- Create policies for data connectors
CREATE POLICY "Users can view their own connectors" 
ON public.data_connectors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own connectors" 
ON public.data_connectors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connectors" 
ON public.data_connectors 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connectors" 
ON public.data_connectors 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_data_connectors_updated_at
BEFORE UPDATE ON public.data_connectors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();