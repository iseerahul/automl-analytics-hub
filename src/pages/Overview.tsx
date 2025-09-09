import { BarChart3, Database, Brain, TrendingUp, Users, Activity } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const metrics = [
  {
    title: "Active Models",
    value: "24",
    change: "+3 this week",
    changeType: "positive" as const,
    icon: Brain,
  },
  {
    title: "Datasets Connected",
    value: "156",
    change: "+12 this month",
    changeType: "positive" as const,
    icon: Database,
  },
  {
    title: "Predictions Made",
    value: "1.2M",
    change: "+15% vs last month",
    changeType: "positive" as const,
    icon: BarChart3,
  },
  {
    title: "Model Accuracy",
    value: "94.2%",
    change: "+2.1% improvement",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
];

const recentModels = [
  {
    name: "Customer Churn Predictor",
    status: "Active",
    accuracy: 94.2,
    lastUpdated: "2 hours ago",
  },
  {
    name: "Product Recommendation Engine",
    status: "Training",
    accuracy: 0,
    lastUpdated: "Training in progress",
  },
  {
    name: "Sales Forecasting Model",
    status: "Active",
    accuracy: 91.8,
    lastUpdated: "1 day ago",
  },
  {
    name: "Fraud Detection System",
    status: "Active",
    accuracy: 96.5,
    lastUpdated: "3 hours ago",
  },
];

export default function Overview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your AI models.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          Create New Model
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Models */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recent Models
            </CardTitle>
            <CardDescription>
              Monitor your latest AI model deployments and training progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentModels.map((model, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{model.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {model.lastUpdated}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {model.status === "Training" ? (
                    <Badge variant="outline" className="text-warning border-warning">
                      <Activity className="h-3 w-3 mr-1" />
                      Training
                    </Badge>
                  ) : (
                    <>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {model.accuracy}% accuracy
                        </p>
                        <Progress value={model.accuracy} className="w-16 h-2" />
                      </div>
                      <Badge variant="outline" className="text-success border-success">
                        Active
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common workflows to get you started quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Upload New Dataset</p>
                  <p className="text-sm text-muted-foreground">
                    Connect data from files, databases, or APIs
                  </p>
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Train New Model</p>
                  <p className="text-sm text-muted-foreground">
                    Create predictive models with AutoML
                  </p>
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Generate Insights</p>
                  <p className="text-sm text-muted-foreground">
                    Analyze patterns in your data automatically
                  </p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}