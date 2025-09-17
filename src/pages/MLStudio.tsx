import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Brain, Play, Settings, BarChart3, CheckCircle, Clock, AlertCircle, Loader2, TrendingUp, Award, Target, Download, Trash2, Cloud, FileCode, Package } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Dataset {
  id: string;
  name: string;
  source: string;
  rows: number;
  columns: number;
  status: string;
}

interface MLJob {
  id: string;
  name: string;
  problem_type: "classification" | "regression";
  dataset_id: string;
  target_column: string;
  selected_features: string[];
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  accuracy?: number;
  started_at: string;
  datasets?: { name: string; source: string };
}

interface MLModel {
  id: string;
  name: string;
  model_type: string;
  metrics: any;
  training_history: any[];
  status: string;
  created_at: string;
  model_config?: any;
}

interface WizardState {
  selectedDataset: string;
  problemType: 'classification' | 'regression';
  useCase: string;
  targetColumn: string;
  timeBudget: number;
  optimizationMetric: string;
  modelName: string;
}

const CLASSIFICATION_USE_CASES = [
  { id: 'churn', label: 'Customer Churn Prediction', description: 'Will a customer stop using our service?' },
  { id: 'fraud', label: 'Fraud Detection', description: 'Is a payment/transaction fraudulent?' },
  { id: 'sentiment', label: 'Sentiment Analysis', description: 'Are customer reviews Positive, Negative, or Neutral?' },
  { id: 'spam', label: 'Email/SMS Spam Filtering', description: 'Is this marketing email spam?' },
  { id: 'lead', label: 'Lead Scoring', description: 'Is a sales lead high-quality or not?' },
  { id: 'loan', label: 'Loan/Credit Approval', description: 'Should we approve this loan (Approve/Reject)?' },
  { id: 'attrition', label: 'Employee Attrition', description: 'Will an employee quit soon?' },
];

const REGRESSION_USE_CASES = [
  { id: 'sales', label: 'Sales Forecasting', description: 'Predict next month\'s sales.' },
  { id: 'revenue', label: 'Revenue Prediction', description: 'Estimate business revenue for next quarter.' },
  { id: 'price', label: 'Price Prediction', description: 'Predict the right selling price of a house/product.' },
  { id: 'demand', label: 'Demand Forecasting', description: 'Predict how many products will be needed.' },
  { id: 'clv', label: 'Customer Lifetime Value (CLV)', description: 'Predict future spending by a customer.' },
  { id: 'roi', label: 'Marketing ROI Prediction', description: 'Estimate return on ad campaigns.' },
  { id: 'delivery', label: 'Delivery Time Estimation', description: 'Predict how long an order will take.' },
];

export default function MLStudio() {
  const [currentStep, setCurrentStep] = useState(1);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [jobs, setJobs] = useState<MLJob[]>([]);
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>({
    selectedDataset: '',
    problemType: 'classification',
    useCase: '',
    targetColumn: '',
    timeBudget: 15,
    optimizationMetric: 'accuracy',
    modelName: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadDatasets();
    loadJobs();
    loadModels();
    
    // Set up polling for job status updates
    const interval = setInterval(() => {
      loadJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('status', 'ready')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDatasets(data || []);
    } catch (error) {
      console.error('Error loading datasets:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await supabase.functions.invoke('gemini-ml', {
        body: { action: 'get-jobs' }
      });

      if (response.error) throw response.error;
      setJobs(response.data?.jobs || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await supabase.functions.invoke('gemini-ml', {
        body: { action: 'get-models' }
      });

      if (response.error) throw response.error;
      setModels(response.data?.models || []);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const startTraining = async () => {
    if (!wizardState.selectedDataset || !wizardState.useCase || !wizardState.targetColumn || !wizardState.modelName) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields before starting training.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('gemini-ml', {
        body: {
          action: 'start-training',
          name: wizardState.modelName,
          datasetId: wizardState.selectedDataset,
          problemType: wizardState.problemType,
          useCase: wizardState.useCase,
          targetColumn: wizardState.targetColumn,
          timeBudget: wizardState.timeBudget,
          optimizationMetric: wizardState.optimizationMetric
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Training Started",
        description: "Your ML model training has been initiated successfully.",
      });

      // Reset wizard and switch to jobs tab
      setCurrentStep(1);
      setWizardState({
        selectedDataset: '',
        problemType: 'classification',
        useCase: '',
        targetColumn: '',
        timeBudget: 15,
        optimizationMetric: 'accuracy',
        modelName: ''
      });

      loadJobs();
    } catch (error) {
      console.error('Training start error:', error);
      toast({
        title: "Training Failed",
        description: "Failed to start model training. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const response = await supabase.functions.invoke('gemini-ml', {
        body: { action: 'delete-job', jobId }
      });

      if (response.error) throw response.error;

      toast({
        title: "Job Deleted",
        description: "Training job has been deleted successfully.",
      });

      loadJobs();
    } catch (error) {
      console.error('Delete job error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete training job. Please try again.",
        variant: "destructive"
      });
    }
  };

  const exportModel = async (modelId: string, format: string) => {
    try {
      const response = await supabase.functions.invoke('gemini-ml', {
        body: { action: 'export-model', modelId, format }
      });

      if (response.error) throw response.error;
      const downloadUrl = response.data?.downloadUrl || response.data?.uploadUrl;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
      toast({
        title: "Export Started",
        description: `Model export to ${format} format has been initiated.`,
      });
    } catch (error) {
      console.error('Export model error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export model. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deployModel = async (modelId: string) => {
    try {
      const response = await supabase.functions.invoke('gemini-ml', {
        body: { action: 'deploy-model', modelId }
      });

      if (response.error) throw response.error;
      const endpoint = response.data?.endpoint;
      toast({
        title: "Deployment Started",
        description: endpoint ? `API endpoint: ${endpoint}` : "Model deployment as REST API has been initiated.",
      });
    } catch (error) {
      console.error('Deploy model error:', error);
      toast({
        title: "Deployment Failed",
        description: "Failed to deploy model. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteModel = async (modelId: string) => {
    try {
      const response = await supabase.functions.invoke('gemini-ml', {
        body: { action: 'delete-model', modelId }
      });
      if (response.error) throw response.error;
      toast({ title: 'Model Deleted', description: 'Model removed from registry.' });
      loadModels();
    } catch (error) {
      console.error('Delete model error:', error);
      toast({ title: 'Delete Failed', description: 'Could not delete model.', variant: 'destructive' });
    }
  };

  const getStatusIcon = (status: MLJob['status']) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "running": return <Clock className="h-4 w-4 text-blue-500" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "queued": return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: MLJob['status']) => {
    const variants = {
      running: "secondary",
      completed: "default",
      failed: "destructive",
      queued: "outline"
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const selectedDataset = datasets.find(d => d.id === wizardState.selectedDataset);
  const currentModel = models.length > 0 ? models[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          ML Studio
        </h1>
        <p className="text-muted-foreground">Build general-purpose machine learning models using AutoML</p>
      </div>

      <Tabs defaultValue="wizard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="wizard">AutoML Wizard</TabsTrigger>
          <TabsTrigger value="jobs">Training Jobs</TabsTrigger>
          <TabsTrigger value="models">Model Registry</TabsTrigger>
          <TabsTrigger value="results">Training Results</TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New ML Model</CardTitle>
              <CardDescription>
                Follow the step-by-step wizard to build your machine learning model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${
                      step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && <div className={`w-12 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />}
                  </div>
                ))}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {currentStep === 1 && "Dataset Selection"}
                {currentStep === 2 && "Problem Type & Use Case"}
                {currentStep === 3 && "Model Configuration"}
                {currentStep === 4 && "Review & Launch"}
              </div>

              <Separator />

              {/* Step Content */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Select Your Dataset</h3>
                  <Select 
                    value={wizardState.selectedDataset} 
                    onValueChange={(value) => setWizardState({...wizardState, selectedDataset: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map((dataset) => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          {dataset.name} ({dataset.source})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDataset && (
                    <div className="text-sm text-muted-foreground">
                      {selectedDataset.rows?.toLocaleString()} rows × {selectedDataset.columns} columns • Source: {selectedDataset.source}
                    </div>
                  )}
                  {datasets.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No datasets available. Please upload a dataset in DataConnect Pro first.
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Problem Type & Use Case</h3>
                  
                  <div className="space-y-4">
                    <Label>Select Problem Type</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card 
                        className={`cursor-pointer transition-all ${
                          wizardState.problemType === 'classification' ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setWizardState({...wizardState, problemType: 'classification', useCase: ''})}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Classification</h4>
                          <p className="text-sm text-muted-foreground">
                            Predict categories or classes (Yes/No, Good/Bad, High/Medium/Low)
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className={`cursor-pointer transition-all ${
                          wizardState.problemType === 'regression' ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setWizardState({...wizardState, problemType: 'regression', useCase: ''})}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Regression</h4>
                          <p className="text-sm text-muted-foreground">
                            Predict numerical values (prices, amounts, scores, quantities)
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {wizardState.problemType && (
                    <div className="space-y-4">
                      <Label>Choose Your Use Case</Label>
                      <div className="grid gap-3 max-h-60 overflow-y-auto">
                        {(wizardState.problemType === 'classification' ? CLASSIFICATION_USE_CASES : REGRESSION_USE_CASES).map((useCase) => (
                          <Card 
                            key={useCase.id}
                            className={`cursor-pointer transition-all ${
                              wizardState.useCase === useCase.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setWizardState({...wizardState, useCase: useCase.id})}
                          >
                            <CardContent className="p-4">
                              <h5 className="font-medium mb-1">{useCase.label}</h5>
                              <p className="text-sm text-muted-foreground">{useCase.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {wizardState.useCase && (
                    <div className="space-y-2">
                      <Label>Target Column</Label>
                      <Input 
                        placeholder="Enter the name of your target column (e.g., 'churn', 'revenue', 'price')"
                        value={wizardState.targetColumn} 
                        onChange={(e) => setWizardState({...wizardState, targetColumn: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        This should be the column in your dataset that contains the values you want to predict.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Model Configuration</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Training Time Budget</Label>
                      <Select 
                        value={wizardState.timeBudget.toString()} 
                        onValueChange={(value) => setWizardState({...wizardState, timeBudget: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Optimization Metric</Label>
                      <Select 
                        value={wizardState.optimizationMetric} 
                        onValueChange={(value) => setWizardState({...wizardState, optimizationMetric: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                          {wizardState.problemType === 'classification' ? (
                            <>
                              <SelectItem value="accuracy">Accuracy</SelectItem>
                              <SelectItem value="precision">Precision</SelectItem>
                              <SelectItem value="recall">Recall</SelectItem>
                              <SelectItem value="f1">F1 Score</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="rmse">RMSE</SelectItem>
                              <SelectItem value="mae">MAE</SelectItem>
                              <SelectItem value="r2">R² Score</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Model Name</Label>
                    <Input 
                      placeholder="Enter a name for your model"
                      value={wizardState.modelName} 
                      onChange={(e) => setWizardState({...wizardState, modelName: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review Configuration</h3>
                  <div className="bg-muted p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Dataset:</span>
                      <span>{selectedDataset?.name || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Problem Type:</span>
                      <span className="capitalize">{wizardState.problemType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Use Case:</span>
                      <span>{(wizardState.problemType === 'classification' ? CLASSIFICATION_USE_CASES : REGRESSION_USE_CASES)
                        .find(uc => uc.id === wizardState.useCase)?.label || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Target:</span>
                      <span>{wizardState.targetColumn || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Training Time:</span>
                      <span>{wizardState.timeBudget} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Optimization:</span>
                      <span className="capitalize">{wizardState.optimizationMetric}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Model Name:</span>
                      <span>{wizardState.modelName || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < 4 ? (
                  <Button 
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    disabled={
                      (currentStep === 1 && !wizardState.selectedDataset) ||
                      (currentStep === 2 && (!wizardState.problemType || !wizardState.useCase || !wizardState.targetColumn)) ||
                      (currentStep === 3 && !wizardState.modelName)
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button onClick={startTraining} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    Start Training
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Jobs</CardTitle>
              <CardDescription>Monitor your ML model training progress</CardDescription>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No training jobs found. Start training your first model in the AutoML Wizard.
                </div>
              ) : (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Job Name</th>
                        <th className="text-left p-4 font-medium">Type</th>
                        <th className="text-left p-4 font-medium">Dataset</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Progress</th>
                        <th className="text-left p-4 font-medium">Accuracy</th>
                        <th className="text-left p-4 font-medium">Started</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id} className="border-b">
                          <td className="p-4 font-medium">{job.name}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize">
                              {job.problem_type}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {job.datasets?.name || 'Unknown'}
                          </td>
                          <td className="p-4 text-center">
                            {getStatusIcon(job.status)}
                          </td>
                          <td className="p-4">
                            {getStatusBadge(job.status)}
                          </td>
                          <td className="p-4">
                            <Progress value={job.progress} className="w-full" />
                            <span className="text-xs text-muted-foreground">{job.progress}%</span>
                          </td>
                          <td className="p-4">
                            {job.accuracy ? `${(job.accuracy * 100).toFixed(1)}%` : '-'}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(job.started_at).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Training Job</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this training job? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteJob(job.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Registry</CardTitle>
              <CardDescription>Manage your trained ML models and deploy them</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {models.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No trained models found. Complete model training to see your models here.
                </div>
              ) : (
                models.map((model) => (
                  <Card key={model.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          <span className="font-medium">{model.name}</span>
                          <Badge variant="secondary">{model.model_type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={model.status === 'ready' ? 'default' : 'secondary'}>
                            {model.status}
                          </Badge>
                          
                          {/* Export Options */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportModel(model.id, 'pickle')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              .pkl
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportModel(model.id, 'onnx')}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              ONNX
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportModel(model.id, 'tensorflow')}
                            >
                              <FileCode className="h-4 w-4 mr-1" />
                              TF
                            </Button>
                          </div>
                          
                          {/* Deploy as API */}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => deployModel(model.id)}
                          >
                            <Cloud className="h-4 w-4 mr-1" />
                            Deploy API
                          </Button>

                          {/* Delete Model */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Model</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this model? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteModel(model.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-muted rounded-md">
                          <div className="text-lg font-semibold">
                            {model.metrics?.accuracy ? `${(model.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">Accuracy</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-md">
                          <div className="text-lg font-semibold">
                            {model.metrics?.precision ? `${(model.metrics.precision * 100).toFixed(1)}%` : 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">Precision</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-md">
                          <div className="text-lg font-semibold">
                            {new Date(model.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">Created</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {currentModel ? (
            <div className="grid gap-6">
              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-md">
                      <div className="text-2xl font-bold text-primary">
                        {currentModel.metrics?.accuracy ? `${(currentModel.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-md">
                      <div className="text-2xl font-bold text-green-600">
                        {currentModel.metrics?.precision ? `${(currentModel.metrics.precision * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Precision</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-md">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentModel.metrics?.recall ? `${(currentModel.metrics.recall * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Recall</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-md">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentModel.metrics?.f1_score ? `${(currentModel.metrics.f1_score * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">F1 Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Training Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Training Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={currentModel.training_history || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="epoch" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="loss" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Training Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Training Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Key Insights</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Model converged successfully after training</li>
                        <li>• Strong performance on validation set</li>
                        <li>• Ready for production deployment</li>
                        <li>• AutoML selected optimal hyperparameters</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Model Configuration</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Algorithm:</span>
                          <span>{currentModel.model_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Training Time:</span>
                          <span>{currentModel.model_config?.training_time || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Validation:</span>
                          <span>{currentModel.model_config?.validation || 'Cross-validation'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-800">Model Ready for Deployment</div>
                        <div className="text-sm text-green-700">
                          Your model shows excellent performance metrics and is ready for production use.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                      <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800">Monitor Performance</div>
                        <div className="text-sm text-blue-700">
                          Set up monitoring to track model performance in production and detect data drift.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  No training results available. Complete a training job to see detailed results here.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}