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
import { Brain, Play, Settings, BarChart3, CheckCircle, Clock, AlertCircle, Loader2, TrendingUp, Award, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

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
  targetColumn: string;
  selectedFeatures: string[];
  timeBudget: number;
  optimizationMetric: string;
  modelName: string;
}

export default function MLStudio() {
  const [currentStep, setCurrentStep] = useState(1);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [jobs, setJobs] = useState<MLJob[]>([]);
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>({
    selectedDataset: '',
    problemType: 'classification',
    targetColumn: '',
    selectedFeatures: [],
    timeBudget: 15,
    optimizationMetric: 'accuracy',
    modelName: ''
  });
  const { toast } = useToast();

  // Sample features for demo (in real implementation, these would come from dataset analysis)
  const availableFeatures = [
    'customer_age', 'total_purchases', 'avg_order_value', 
    'days_since_last_purchase', 'support_tickets', 'account_balance',
    'login_frequency', 'session_duration'
  ];

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
      const response = await supabase.functions.invoke('ml-training', {
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
      const response = await supabase.functions.invoke('ml-training', {
        body: { action: 'get-models' }
      });

      if (response.error) throw response.error;
      setModels(response.data?.models || []);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const startTraining = async () => {
    if (!wizardState.selectedDataset || !wizardState.targetColumn || !wizardState.modelName) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields before starting training.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('ml-training', {
        body: {
          action: 'start-training',
          name: wizardState.modelName,
          datasetId: wizardState.selectedDataset,
          problemType: wizardState.problemType,
          targetColumn: wizardState.targetColumn,
          selectedFeatures: wizardState.selectedFeatures.length > 0 ? wizardState.selectedFeatures : availableFeatures,
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
        targetColumn: '',
        selectedFeatures: [],
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
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${
                      step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step}
                    </div>
                    {step < 5 && <div className={`w-12 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />}
                  </div>
                ))}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {currentStep === 1 && "Dataset Selection"}
                {currentStep === 2 && "Target Variable"}
                {currentStep === 3 && "Feature Engineering"}
                {currentStep === 4 && "Model Configuration"}
                {currentStep === 5 && "Review & Launch"}
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Define Your Target</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Problem Type</Label>
                      <Select 
                        value={wizardState.problemType} 
                        onValueChange={(value: 'classification' | 'regression') => 
                          setWizardState({...wizardState, problemType: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select problem type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classification">Classification</SelectItem>
                          <SelectItem value="regression">Regression</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Column</Label>
                      <Select 
                        value={wizardState.targetColumn} 
                        onValueChange={(value) => setWizardState({...wizardState, targetColumn: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target variable" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="churn">customer_churn</SelectItem>
                          <SelectItem value="revenue">total_revenue</SelectItem>
                          <SelectItem value="satisfaction">satisfaction_score</SelectItem>
                          <SelectItem value="sales">sales_amount</SelectItem>
                          <SelectItem value="conversion">conversion_rate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Feature Engineering</h3>
                  <div className="space-y-2">
                    <Label>Select Features (leave empty to auto-select all features)</Label>
                    <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
                      {availableFeatures.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox 
                            id={feature}
                            checked={wizardState.selectedFeatures.includes(feature)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setWizardState({
                                  ...wizardState, 
                                  selectedFeatures: [...wizardState.selectedFeatures, feature]
                                });
                              } else {
                                setWizardState({
                                  ...wizardState, 
                                  selectedFeatures: wizardState.selectedFeatures.filter(f => f !== feature)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={feature} className="text-sm font-normal">{feature}</Label>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {wizardState.selectedFeatures.length > 0 
                        ? `${wizardState.selectedFeatures.length} features selected`
                        : 'All features will be used for training'
                      }
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
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
                          <SelectItem value="accuracy">Accuracy</SelectItem>
                          <SelectItem value="precision">Precision</SelectItem>
                          <SelectItem value="recall">Recall</SelectItem>
                          <SelectItem value="f1">F1 Score</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
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
                      <span className="font-medium">Target:</span>
                      <span>{wizardState.targetColumn || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Features:</span>
                      <span>
                        {wizardState.selectedFeatures.length > 0 
                          ? `${wizardState.selectedFeatures.length} selected` 
                          : 'All features'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Time Budget:</span>
                      <span>{wizardState.timeBudget} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Optimization:</span>
                      <span className="capitalize">{wizardState.optimizationMetric}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Model Name</Label>
                    <Input 
                      placeholder="e.g., Customer Churn Model v1" 
                      value={wizardState.modelName}
                      onChange={(e) => setWizardState({...wizardState, modelName: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep < 5 ? (
                  <Button onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                    onClick={startTraining}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Starting...' : 'Start Training'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <h3 className="font-semibold">{job.name}</h3>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {job.problem_type} • {job.datasets?.name || 'Unknown dataset'} • Started: {new Date(job.started_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      {job.accuracy && (
                        <div className="text-sm font-medium">
                          Accuracy: {(job.accuracy * 100).toFixed(1)}%
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {job.progress}% complete
                      </div>
                    </div>
                  </div>
                  {job.status === "running" && (
                    <div className="space-y-2">
                      <Progress value={job.progress} className="w-full" />
                      <div className="text-xs text-muted-foreground">
                        Training in progress... Estimated 8 minutes remaining
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          {models.length > 0 ? (
            <div className="grid gap-4">
              {models.map((model) => (
                <Card key={model.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription>
                          {model.model_type} • Created: {new Date(model.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant={model.status === 'ready' ? 'default' : 'secondary'}>
                        {model.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {model.metrics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {Object.entries(model.metrics).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {typeof value === 'number' ? (value * 100).toFixed(1) + '%' : String(value)}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {key.replace('_', ' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {model.training_history && model.training_history.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Training History</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={model.training_history}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="epoch" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="accuracy" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={2}
                                name="Accuracy"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="loss" 
                                stroke="hsl(var(--destructive))" 
                                strokeWidth={2}
                                name="Loss"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No trained models yet.</p>
                  <p className="text-sm">Complete the AutoML wizard to create your first model.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {models.length > 0 ? (
            models.map((model) => (
              <div key={model.id} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      {model.name} - Training Results
                    </CardTitle>
                    <CardDescription>
                      Comprehensive analysis of model performance and training outcomes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Performance Overview */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Model Performance Overview
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {model.metrics && Object.entries(model.metrics).map(([key, value]) => (
                          <div key={key} className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-3xl font-bold text-primary mb-1">
                              {typeof value === 'number' && key !== 'models_trained' ? 
                                (value * 100).toFixed(1) + '%' : 
                                String(value)
                              }
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {key.replace(/_/g, ' ')}
                            </div>
                            {typeof value === 'number' && value > 0.8 && key !== 'models_trained' && (
                              <div className="text-xs text-green-600 mt-1">Excellent</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Training Progress Chart */}
                    {model.training_history && model.training_history.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Training Progress & History
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Accuracy/Performance Chart */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Model Performance Over Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={model.training_history}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      dataKey="model" 
                                      label={{ value: 'Model Number', position: 'insideBottom', offset: -5 }}
                                    />
                                    <YAxis 
                                      label={{ value: 'Performance', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip 
                                      formatter={(value: any, name: string) => [
                                        typeof value === 'number' ? (value * 100).toFixed(2) + '%' : value,
                                        name
                                      ]}
                                    />
                                    <Line 
                                      type="monotone" 
                                      dataKey="accuracy" 
                                      stroke="hsl(var(--primary))" 
                                      strokeWidth={3}
                                      name="Accuracy"
                                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Algorithm Performance Comparison */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Algorithm Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart 
                                    data={model.training_history.slice(-5)} // Last 5 models
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="algorithm" />
                                    <YAxis />
                                    <Tooltip 
                                      formatter={(value: any) => [
                                        typeof value === 'number' ? (value * 100).toFixed(2) + '%' : value,
                                        'Accuracy'
                                      ]}
                                    />
                                    <Bar 
                                      dataKey="accuracy" 
                                      fill="hsl(var(--primary))"
                                      radius={[4, 4, 0, 0]}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Training Summary & Insights */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Training Summary & Insights
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Key Insights</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {model.metrics?.accuracy && (
                              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                <span className="text-sm">Model Accuracy</span>
                                <span className="font-semibold">
                                  {(model.metrics.accuracy * 100).toFixed(1)}%
                                  {model.metrics.accuracy > 0.85 && 
                                    <span className="text-green-600 ml-2">⭐ Excellent</span>
                                  }
                                </span>
                              </div>
                            )}
                            {model.metrics?.models_trained && (
                              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                <span className="text-sm">Models Tested</span>
                                <span className="font-semibold">{model.metrics.models_trained} algorithms</span>
                              </div>
                            )}
                            {model.training_history && (
                              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                <span className="text-sm">Best Algorithm</span>
                                <span className="font-semibold">
                                  {model.training_history.reduce((best, current) => 
                                    current.accuracy > best.accuracy ? current : best
                                  ).algorithm || 'Unknown'}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Model Configuration</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {model.model_config && (
                              <>
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                  <span className="text-sm">Framework</span>
                                  <span className="font-semibold">{model.model_config.framework || 'AutoML'}</span>
                                </div>
                                {model.model_config.automl_config?.problemType && (
                                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                    <span className="text-sm">Problem Type</span>
                                    <span className="font-semibold capitalize">
                                      {model.model_config.automl_config.problemType}
                                    </span>
                                  </div>
                                )}
                                {model.model_config.automl_config?.timeBudget && (
                                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                    <span className="text-sm">Training Time</span>
                                    <span className="font-semibold">
                                      {model.model_config.automl_config.timeBudget} minutes
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Performance Recommendations */}
                    {model.metrics?.accuracy && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Performance Recommendations</h3>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              {model.metrics.accuracy > 0.9 ? (
                                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded">
                                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                  <div>
                                    <div className="font-medium text-green-800">Excellent Performance!</div>
                                    <div className="text-sm text-green-700">
                                      Your model shows outstanding accuracy. Consider deploying it to production.
                                    </div>
                                  </div>
                                </div>
                              ) : model.metrics.accuracy > 0.8 ? (
                                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                                  <div>
                                    <div className="font-medium text-blue-800">Good Performance</div>
                                    <div className="text-sm text-blue-700">
                                      Model performs well. Consider feature engineering or data augmentation for improvement.
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                  <div>
                                    <div className="font-medium text-yellow-800">Room for Improvement</div>
                                    <div className="text-sm text-yellow-700">
                                      Consider adding more data, feature engineering, or trying different algorithms.
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No Training Results Available</p>
                  <p className="text-sm">Complete model training to see detailed results and insights here.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}