import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Brain, Play, Settings, BarChart3, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MLJob {
  id: string;
  name: string;
  type: "classification" | "regression";
  dataset: string;
  status: "running" | "completed" | "failed" | "queued";
  progress: number;
  accuracy?: number;
  startTime: string;
}

const mockJobs: MLJob[] = [
  {
    id: "1",
    name: "Customer Churn Prediction",
    type: "classification", 
    dataset: "customer_data.csv",
    status: "completed",
    progress: 100,
    accuracy: 0.94,
    startTime: "2024-01-15 10:30"
  },
  {
    id: "2",
    name: "Sales Forecasting Model",
    type: "regression",
    dataset: "sales_history.csv", 
    status: "running",
    progress: 65,
    startTime: "2024-01-15 14:20"
  }
];

const trainingMetrics = [
  { epoch: 1, accuracy: 0.72, loss: 0.65 },
  { epoch: 2, accuracy: 0.78, loss: 0.58 },
  { epoch: 3, accuracy: 0.82, loss: 0.52 },
  { epoch: 4, accuracy: 0.85, loss: 0.48 },
  { epoch: 5, accuracy: 0.87, loss: 0.45 },
  { epoch: 6, accuracy: 0.89, loss: 0.42 },
  { epoch: 7, accuracy: 0.91, loss: 0.39 },
  { epoch: 8, accuracy: 0.92, loss: 0.37 },
  { epoch: 9, accuracy: 0.93, loss: 0.35 },
  { epoch: 10, accuracy: 0.94, loss: 0.33 }
];

export default function InsightAI() {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobs, setJobs] = useState<MLJob[]>(mockJobs);

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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer_data">customer_analytics.csv</SelectItem>
                      <SelectItem value="sales_data">sales_forecast_data</SelectItem>
                      <SelectItem value="product_data">product_metrics.json</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground">
                    15,420 rows × 12 columns • Last updated: 2 hours ago
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Define Your Target</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Problem Type</Label>
                      <Select>
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
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target variable" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="churn">customer_churn</SelectItem>
                          <SelectItem value="revenue">total_revenue</SelectItem>
                          <SelectItem value="satisfaction">satisfaction_score</SelectItem>
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
                    <Label>Select Features</Label>
                    <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
                      {["customer_age", "total_purchases", "avg_order_value", "days_since_last_purchase", "support_tickets"].map((feature) => (
                        <label key={feature} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">{feature}</span>
                        </label>
                      ))}
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
                      <Select>
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
                      <Select>
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
                      <span>customer_analytics.csv</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Problem Type:</span>
                      <span>Classification</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Target:</span>
                      <span>customer_churn</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Features:</span>
                      <span>5 selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Time Budget:</span>
                      <span>15 minutes</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Model Name</Label>
                    <Input placeholder="e.g., Customer Churn Model v1" />
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
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Play className="h-4 w-4 mr-2" />
                    Start Training
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
                        {job.type} • {job.dataset} • Started: {job.startTime}
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
          <Card>
            <CardHeader>
              <CardTitle>Training Metrics</CardTitle>
              <CardDescription>Real-time training performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trainingMetrics}>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}