import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Settings, BarChart3, Play, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const forecastData = [
  { date: "2024-01", actual: 125000, predicted: null },
  { date: "2024-02", actual: 132000, predicted: null },
  { date: "2024-03", actual: 128000, predicted: null },
  { date: "2024-04", actual: 145000, predicted: null },
  { date: "2024-05", actual: 152000, predicted: null },
  { date: "2024-06", actual: 148000, predicted: null },
  { date: "2024-07", actual: null, predicted: 155000 },
  { date: "2024-08", actual: null, predicted: 162000 },
  { date: "2024-09", actual: null, predicted: 158000 },
  { date: "2024-10", actual: null, predicted: 165000 },
  { date: "2024-11", actual: null, predicted: 172000 },
  { date: "2024-12", actual: null, predicted: 168000 }
];

const seasonalityData = [
  { month: "Jan", sales: 120, trend: 115 },
  { month: "Feb", sales: 135, trend: 130 },
  { month: "Mar", sales: 125, trend: 128 },
  { month: "Apr", sales: 148, trend: 145 },
  { month: "May", sales: 155, trend: 152 },
  { month: "Jun", sales: 142, trend: 148 },
  { month: "Jul", sales: 138, trend: 140 },
  { month: "Aug", sales: 162, trend: 158 },
  { month: "Sep", sales: 158, trend: 155 },
  { month: "Oct", sales: 175, trend: 168 },
  { month: "Nov", sales: 182, trend: 175 },
  { month: "Dec", sales: 195, trend: 185 }
];

interface ForecastModel {
  id: string;
  name: string;
  dataset: string;
  horizon: string;
  accuracy: number;
  status: "active" | "training" | "draft";
  lastUpdated: string;
}

const models: ForecastModel[] = [
  {
    id: "1",
    name: "Monthly Sales Forecast",
    dataset: "sales_history.csv",
    horizon: "12 months",
    accuracy: 92.5,
    status: "active",
    lastUpdated: "2024-01-15"
  },
  {
    id: "2", 
    name: "Weekly Demand Prediction",
    dataset: "demand_data.json",
    horizon: "8 weeks",
    accuracy: 88.3,
    status: "training",
    lastUpdated: "2024-01-14"
  }
];

export default function ForecastPro() {
  const [selectedModel, setSelectedModel] = useState<string>("1");

  const getStatusBadge = (status: ForecastModel['status']) => {
    const variants = {
      active: "default",
      training: "secondary", 
      draft: "outline"
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          ForecastPro
        </h1>
        <p className="text-muted-foreground">Advanced time-series forecasting and trend analysis</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Forecast Dashboard</TabsTrigger>
          <TabsTrigger value="models">My Models</TabsTrigger>
          <TabsTrigger value="create">Create Forecast</TabsTrigger>
          <TabsTrigger value="analysis">Trend Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Next Month Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$155,000</div>
                <p className="text-sm text-green-600">+5.2% from current month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Forecast Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92.5%</div>
                <p className="text-sm text-muted-foreground">30-day rolling average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confidence Interval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">±8.2%</div>
                <p className="text-sm text-muted-foreground">95% confidence level</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Sales Forecast - Next 6 Months
              </CardTitle>
              <CardDescription>
                Predicted vs actual sales performance with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `$${value?.toLocaleString()}`, 
                        name === 'actual' ? 'Actual Sales' : 'Predicted Sales'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Actual"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      name="Forecast"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4">
            {models.map((model) => (
              <Card key={model.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{model.name}</h3>
                        {getStatusBadge(model.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Dataset: {model.dataset}</span>
                        <span>Horizon: {model.horizon}</span>
                        <span>Accuracy: {model.accuracy}%</span>
                        <span>Updated: {model.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Forecast Model</CardTitle>
              <CardDescription>
                Set up a new time-series forecasting model with your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Model Name</Label>
                  <Input placeholder="e.g., Q4 Revenue Forecast" />
                </div>
                <div className="space-y-2">
                  <Label>Dataset</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">sales_history.csv</SelectItem>
                      <SelectItem value="revenue">revenue_monthly.json</SelectItem>
                      <SelectItem value="demand">demand_forecast.csv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time Column</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">date</SelectItem>
                      <SelectItem value="timestamp">timestamp</SelectItem>
                      <SelectItem value="month">month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Variable</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target to forecast" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">total_sales</SelectItem>
                      <SelectItem value="revenue">revenue</SelectItem>
                      <SelectItem value="units">units_sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Forecast Horizon</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="How far to predict" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Seasonality</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Expected seasonality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                <Play className="h-4 w-4 mr-2" />
                Start Training Forecast Model
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Seasonality Analysis
              </CardTitle>
              <CardDescription>
                Historical patterns and seasonal trends in your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={seasonalityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name="Actual Sales"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="trend" 
                      stackId="2"
                      stroke="hsl(var(--secondary))" 
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.3}
                      name="Trend Line"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}