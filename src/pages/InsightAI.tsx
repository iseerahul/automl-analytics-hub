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
import { Brain, Play, Settings, BarChart3, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

export default function InsightAI() {
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
          InsightAI
        </h1>
        <p className="text-muted-foreground">Build machine learning models with automated ML workflows</p>
      </div>

      <Tabs defaultValue="wizard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="wizard">AutoML Wizard</TabsTrigger>
          <TabsTrigger value="jobs">Training Jobs</TabsTrigger>
          <TabsTrigger value="models">Model Registry</TabsTrigger>
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
      </Tabs>
    </div>
  );
}