import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Target, Settings, BarChart3, Play, Star, ThumbsUp, ShoppingCart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RecommendationModel {
  id: string;
  name: string;
  type: "collaborative" | "content-based" | "hybrid";
  status: "active" | "training" | "draft";
  accuracy: number;
  coverage: number;
  lastUpdated: string;
}

interface Recommendation {
  id: string;
  title: string;
  score: number;
  reason: string;
  category: string;
  price: number;
}

const models: RecommendationModel[] = [
  {
    id: "1",
    name: "Product Recommendations",
    type: "collaborative",
    status: "active",
    accuracy: 87.3,
    coverage: 94.2,
    lastUpdated: "2024-01-15"
  },
  {
    id: "2", 
    name: "Content Discovery Engine",
    type: "hybrid",
    status: "active",
    accuracy: 91.7,
    coverage: 89.1,
    lastUpdated: "2024-01-14"
  },
  {
    id: "3",
    name: "Cross-sell Optimizer",
    type: "content-based",
    status: "training",
    accuracy: 0,
    coverage: 0,
    lastUpdated: "2024-01-15"
  }
];

const sampleRecommendations: Recommendation[] = [
  {
    id: "1",
    title: "Premium Wireless Headphones",
    score: 0.94,
    reason: "Similar users who bought your recent purchases",
    category: "Electronics",
    price: 299
  },
  {
    id: "2",
    title: "Advanced Photography Course",
    score: 0.89,
    reason: "Based on your interest in creative tools",
    category: "Education",
    price: 149
  },
  {
    id: "3",
    title: "Ergonomic Office Chair",
    score: 0.85,
    reason: "Frequently bought together with desk accessories",
    category: "Furniture",
    price: 459
  }
];

const performanceData = [
  { metric: "Click-through Rate", value: 12.4, benchmark: 8.2 },
  { metric: "Conversion Rate", value: 5.7, benchmark: 3.1 },
  { metric: "Revenue per User", value: 47.3, benchmark: 31.8 },
  { metric: "Engagement Score", value: 78.9, benchmark: 65.2 }
];

export default function RecommendPro() {
  const [selectedUserId, setSelectedUserId] = useState<string>("12345");

  const getStatusBadge = (status: RecommendationModel['status']) => {
    const variants = {
      active: "default",
      training: "secondary", 
      draft: "outline"
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getTypeColor = (type: RecommendationModel['type']) => {
    const colors = {
      collaborative: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      "content-based": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      hybrid: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          RecommendPro
        </h1>
        <p className="text-muted-foreground">Build intelligent recommendation systems for personalized user experiences</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Performance Dashboard</TabsTrigger>
          <TabsTrigger value="models">Recommendation Models</TabsTrigger>
          <TabsTrigger value="test">Test Recommendations</TabsTrigger>
          <TabsTrigger value="create">Build New Model</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-sm text-muted-foreground">Recommendation engines</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.4%</div>
                <p className="text-sm text-green-600">+3.2% vs benchmark</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5.7%</div>
                <p className="text-sm text-green-600">+2.6% vs benchmark</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+48.7%</div>
                <p className="text-sm text-muted-foreground">Revenue per user lift</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance vs Benchmarks
              </CardTitle>
              <CardDescription>
                How your recommendation models perform compared to industry benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="metric" 
                      fontSize={12}
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))" 
                      name="Your Performance"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="benchmark" 
                      fill="hsl(var(--muted))" 
                      name="Industry Benchmark"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
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
                        <Badge className={getTypeColor(model.type)} variant="outline">
                          {model.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>Accuracy: {model.accuracy}%</span>
                        <span>Coverage: {model.coverage}%</span>
                        <span>Updated: {model.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-1" />
                        Deploy
                      </Button>
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

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Recommendations</CardTitle>
              <CardDescription>
                Preview recommendations for any user to test your models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>User ID</Label>
                  <Input 
                    placeholder="Enter user ID or email"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Product Recommendations</SelectItem>
                      <SelectItem value="2">Content Discovery Engine</SelectItem>
                      <SelectItem value="3">Cross-sell Optimizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Get Recommendations</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Recommendations for User {selectedUserId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleRecommendations.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge variant="outline">{rec.category}</Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {(rec.score * 5).toFixed(1)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold">${rec.price}</div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <ShoppingCart className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Build New Recommendation Model</CardTitle>
              <CardDescription>
                Create a customized recommendation engine for your specific use case
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Model Name</Label>
                  <Input placeholder="e.g., Article Recommendations" />
                </div>
                <div className="space-y-2">
                  <Label>Recommendation Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="collaborative">Collaborative Filtering</SelectItem>
                      <SelectItem value="content">Content-Based</SelectItem>
                      <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                      <SelectItem value="deep">Deep Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>User Data Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="users">user_profiles.csv</SelectItem>
                      <SelectItem value="interactions">user_interactions.json</SelectItem>
                      <SelectItem value="behavior">browsing_behavior.csv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Item Data Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="products">product_catalog.csv</SelectItem>
                      <SelectItem value="content">content_metadata.json</SelectItem>
                      <SelectItem value="articles">article_features.csv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Business Objective</Label>
                <Textarea 
                  placeholder="Describe what you want to optimize for (e.g., increase click-through rate, boost revenue, improve user engagement)"
                  className="min-h-20"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Evaluation Metric</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Primary metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="precision">Precision@K</SelectItem>
                      <SelectItem value="recall">Recall@K</SelectItem>
                      <SelectItem value="ndcg">NDCG</SelectItem>
                      <SelectItem value="map">Mean Average Precision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Training Duration</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Recommendations Count</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Per user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 recommendations</SelectItem>
                      <SelectItem value="10">10 recommendations</SelectItem>
                      <SelectItem value="20">20 recommendations</SelectItem>
                      <SelectItem value="50">50 recommendations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                <Play className="h-4 w-4 mr-2" />
                Train Recommendation Model
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}