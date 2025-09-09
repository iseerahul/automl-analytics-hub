import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Zap, TrendingUp, Users, DollarSign, Calendar, Filter, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/ui/metric-card";

const salesData = [
  { month: "Jan", sales: 4000, predictions: 4200 },
  { month: "Feb", sales: 3000, predictions: 3100 },
  { month: "Mar", sales: 5000, predictions: 4800 },
  { month: "Apr", sales: 4500, predictions: 4600 },
  { month: "May", sales: 6000, predictions: 5900 },
  { month: "Jun", sales: 5500, predictions: 5700 },
];

const customerSegments = [
  { name: "High Value", value: 35, color: "#8B5CF6" },
  { name: "Medium Value", value: 45, color: "#A855F7" },
  { name: "Low Value", value: 20, color: "#C084FC" },
];

const insights = [
  {
    title: "Revenue Spike Detected",
    description: "Q2 revenue is 25% above forecast due to premium product adoption",
    type: "positive",
    confidence: 94,
  },
  {
    title: "Churn Risk Alert",
    description: "15% of enterprise customers show early churn indicators",
    type: "warning",
    confidence: 87,
  },
  {
    title: "Seasonal Pattern Found",
    description: "Weekly sales peak on Thursdays, suggesting optimal campaign timing",
    type: "neutral",
    confidence: 92,
  },
];

export default function QuickInsights() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Quick Insights
          </h1>
          <p className="text-muted-foreground">
            AI-powered analytics snapshots from your data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Revenue Growth"
          value="+25.3%"
          change="vs last period"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Customer Acquisition"
          value="1,247"
          change="+18% this month"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Prediction Accuracy"
          value="94.2%"
          change="+2.1% improvement"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title="Active Models"
          value="24"
          change="3 new deployments"
          changeType="neutral"
          icon={Zap}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales vs Predictions</CardTitle>
            <CardDescription>
              Actual sales performance compared to AI forecasts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Actual Sales"
                />
                <Line 
                  type="monotone" 
                  dataKey="predictions" 
                  stroke="#A855F7" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="AI Predictions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>
              AI-identified customer value segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegments}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI-Generated Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI-Generated Insights
          </CardTitle>
          <CardDescription>
            Automatically discovered patterns and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{insight.title}</h4>
                  <Badge
                    variant={
                      insight.type === "positive"
                        ? "default"
                        : insight.type === "warning"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {insight.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}