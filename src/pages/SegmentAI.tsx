import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Settings, BarChart3, Play, Filter } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const segmentationData = [
  { x: 25, y: 45000, segment: "Young Professionals", size: 250 },
  { x: 35, y: 65000, segment: "Mid Career", size: 180 },
  { x: 45, y: 85000, segment: "Established", size: 320 },
  { x: 55, y: 95000, segment: "Senior Executive", size: 150 },
  { x: 28, y: 35000, segment: "Young Professionals", size: 220 },
  { x: 38, y: 72000, segment: "Mid Career", size: 190 },
  { x: 48, y: 88000, segment: "Established", size: 280 },
  { x: 52, y: 110000, segment: "Senior Executive", size: 160 },
];

const segmentDistribution = [
  { name: "Young Professionals", value: 35, color: "#8B5CF6" },
  { name: "Mid Career", value: 28, color: "#06B6D4" },
  { name: "Established", value: 25, color: "#10B981" },
  { name: "Senior Executive", value: 12, color: "#F59E0B" }
];

interface Segment {
  id: string;
  name: string;
  size: number;
  avgValue: number;
  characteristics: string[];
  color: string;
}

const customerSegments: Segment[] = [
  {
    id: "1",
    name: "High-Value Professionals",
    size: 1250,
    avgValue: 95000,
    characteristics: ["High income", "Age 35-50", "Urban location", "Tech-savvy"],
    color: "#8B5CF6"
  },
  {
    id: "2",
    name: "Budget-Conscious Families",
    size: 2100,
    avgValue: 45000,
    characteristics: ["Price sensitive", "Age 25-40", "Suburban", "Value seekers"],
    color: "#06B6D4"
  },
  {
    id: "3",
    name: "Premium Seniors",
    size: 850,
    avgValue: 125000,
    characteristics: ["High spending", "Age 55+", "Quality focused", "Brand loyal"],
    color: "#10B981"
  }
];

export default function SegmentAI() {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          SegmentAI
        </h1>
        <p className="text-muted-foreground">Intelligent customer segmentation and clustering analysis</p>
      </div>

      <Tabs defaultValue="segments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="segments">Active Segments</TabsTrigger>
          <TabsTrigger value="analysis">Cluster Analysis</TabsTrigger>
          <TabsTrigger value="create">Create Segments</TabsTrigger>
          <TabsTrigger value="insights">Segment Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-sm text-muted-foreground">Active customer groups</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Largest Segment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,100</div>
                <p className="text-sm text-muted-foreground">Budget-Conscious Families</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Highest Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$125K</div>
                <p className="text-sm text-muted-foreground">Premium Seniors avg</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Segmentation Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.7/10</div>
                <p className="text-sm text-green-600">Excellent separation</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {customerSegments.map((segment) => (
              <Card key={segment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <h3 className="font-semibold">{segment.name}</h3>
                        <Badge variant="outline">{segment.size.toLocaleString()} customers</Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>Avg Value: ${segment.avgValue.toLocaleString()}</span>
                        <span>Size: {((segment.size / 4200) * 100).toFixed(1)}% of total</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {segment.characteristics.map((char, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-1" />
                        Target
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Clusters</CardTitle>
                <CardDescription>
                  Age vs Income segmentation with cluster sizes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={segmentationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="x" 
                        name="Age"
                        domain={[20, 60]}
                      />
                      <YAxis 
                        dataKey="y" 
                        name="Income"
                        domain={[30000, 120000]}
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-md">
                                <p className="font-medium">{data.segment}</p>
                                <p className="text-sm">Age: {data.x}</p>
                                <p className="text-sm">Income: ${data.y.toLocaleString()}</p>
                                <p className="text-sm">Cluster Size: {data.size}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter 
                        dataKey="size" 
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Distribution</CardTitle>
                <CardDescription>
                  Customer distribution across identified segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={segmentDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {segmentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Segmentation</CardTitle>
              <CardDescription>
                Define clustering parameters to discover new customer segments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Segmentation Name</Label>
                  <Input placeholder="e.g., Geographic Segments" />
                </div>
                <div className="space-y-2">
                  <Label>Dataset</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customers">customer_data.csv</SelectItem>
                      <SelectItem value="transactions">transaction_history.json</SelectItem>
                      <SelectItem value="behavior">user_behavior.csv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Features for Clustering</Label>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 p-4 border rounded-md max-h-40 overflow-y-auto">
                  {[
                    "age", "income", "spending_score", "frequency", "recency", 
                    "avg_order_value", "location", "channel_preference", "tenure"
                  ].map((feature) => (
                    <label key={feature} className="flex items-center space-x-2 text-sm">
                      <input 
                        type="checkbox" 
                        className="rounded" 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFeatures([...selectedFeatures, feature]);
                          } else {
                            setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
                          }
                        }}
                      />
                      <span>{feature}</span>
                    </label>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedFeatures.length} features selected
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Algorithm</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kmeans">K-Means</SelectItem>
                      <SelectItem value="hierarchical">Hierarchical</SelectItem>
                      <SelectItem value="dbscan">DBSCAN</SelectItem>
                      <SelectItem value="gaussian">Gaussian Mixture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Clusters</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect optimal</SelectItem>
                      <SelectItem value="3">3 clusters</SelectItem>
                      <SelectItem value="4">4 clusters</SelectItem>
                      <SelectItem value="5">5 clusters</SelectItem>
                      <SelectItem value="6">6 clusters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Scaling Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Standard scaling" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Scaling</SelectItem>
                      <SelectItem value="minmax">Min-Max Scaling</SelectItem>
                      <SelectItem value="robust">Robust Scaling</SelectItem>
                      <SelectItem value="none">No Scaling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                <Play className="h-4 w-4 mr-2" />
                Start Clustering Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Segment Performance</CardTitle>
                <CardDescription>Revenue and engagement metrics by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerSegments.map((segment) => (
                    <div key={segment.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <div>
                          <div className="font-medium">{segment.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {segment.size.toLocaleString()} customers
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${segment.avgValue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">avg value</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actionable Recommendations</CardTitle>
                <CardDescription>AI-generated insights for each segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md border border-purple-200 dark:border-purple-800">
                    <div className="font-medium text-purple-900 dark:text-purple-100">High-Value Professionals</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                      Target with premium product offerings and exclusive access programs. 
                      High conversion potential for upselling.
                    </div>
                  </div>
                  
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-md border border-cyan-200 dark:border-cyan-800">
                    <div className="font-medium text-cyan-900 dark:text-cyan-100">Budget-Conscious Families</div>
                    <div className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">
                      Focus on value propositions, bundle deals, and loyalty programs. 
                      Price-sensitive but high volume potential.
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                    <div className="font-medium text-green-900 dark:text-green-100">Premium Seniors</div>
                    <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Emphasize quality, personalized service, and brand heritage. 
                      Ideal for premium product launches.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}