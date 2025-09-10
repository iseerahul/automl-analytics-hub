import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Layout, Plus, Eye, Settings, Share2, Download, Grid3X3, BarChart3, PieChart, LineChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: number;
  lastModified: string;
  status: "published" | "draft" | "archived";
  views: number;
}

interface Widget {
  id: string;
  type: "metric" | "chart" | "table" | "text";
  title: string;
  size: "small" | "medium" | "large";
  position: { x: number; y: number };
}

const dashboards: Dashboard[] = [
  {
    id: "1",
    name: "Executive Summary",
    description: "High-level KPIs and business metrics",
    widgets: 8,
    lastModified: "2024-01-15",
    status: "published",
    views: 245
  },
  {
    id: "2",
    name: "ML Model Performance",
    description: "Training metrics and model monitoring",
    widgets: 12,
    lastModified: "2024-01-14",
    status: "published", 
    views: 89
  },
  {
    id: "3",
    name: "Customer Analytics",
    description: "Customer behavior and segmentation insights",
    widgets: 6,
    lastModified: "2024-01-13",
    status: "draft",
    views: 12
  }
];

const sampleChartData = [
  { name: "Jan", revenue: 45000, users: 1200 },
  { name: "Feb", revenue: 52000, users: 1350 },
  { name: "Mar", revenue: 48000, users: 1180 },
  { name: "Apr", revenue: 61000, users: 1420 },
  { name: "May", revenue: 58000, users: 1380 },
  { name: "Jun", revenue: 67000, users: 1550 }
];

const pieData = [
  { name: "Desktop", value: 45, color: "#8B5CF6" },
  { name: "Mobile", value: 35, color: "#06B6D4" },
  { name: "Tablet", value: 20, color: "#10B981" }
];

export default function DashboardStudio() {
  const [selectedDashboard, setSelectedDashboard] = useState<string>("1");
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const getStatusBadge = (status: Dashboard['status']) => {
    const variants = {
      published: "default",
      draft: "secondary",
      archived: "outline"
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const widgetTypes = [
    { id: "metric", name: "Metric Card", icon: Grid3X3, description: "Display KPI values" },
    { id: "bar", name: "Bar Chart", icon: BarChart3, description: "Compare categories" },
    { id: "line", name: "Line Chart", icon: LineChart, description: "Show trends over time" },
    { id: "pie", name: "Pie Chart", icon: PieChart, description: "Show proportions" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Layout className="h-8 w-8 text-primary" />
          DashboardStudio
        </h1>
        <p className="text-muted-foreground">Create custom dashboards with drag-and-drop components</p>
      </div>

      <Tabs defaultValue="dashboards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboards">My Dashboards</TabsTrigger>
          <TabsTrigger value="builder">Dashboard Builder</TabsTrigger>
          <TabsTrigger value="widgets">Widget Library</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Your Dashboards</h2>
              <p className="text-sm text-muted-foreground">Manage and organize your custom dashboards</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              New Dashboard
            </Button>
          </div>

          <div className="grid gap-4">
            {dashboards.map((dashboard) => (
              <Card key={dashboard.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{dashboard.name}</h3>
                        {getStatusBadge(dashboard.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{dashboard.description}</p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>{dashboard.widgets} widgets</span>
                        <span>{dashboard.views} views</span>
                        <span>Modified: {dashboard.lastModified}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Dashboard Builder</h2>
              <p className="text-sm text-muted-foreground">Drag and drop components to build your dashboard</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Widget Palette */}
            <div className="space-y-4">
              <h3 className="font-medium">Widget Palette</h3>
              <div className="space-y-2">
                {widgetTypes.map((widget) => {
                  const IconComponent = widget.icon;
                  return (
                    <div
                      key={widget.id}
                      className="p-3 border rounded-lg cursor-grab hover:bg-muted/50 transition-colors"
                      draggable
                      onDragStart={() => setDraggedWidget(widget.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">{widget.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{widget.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-3">
              <div 
                className="min-h-96 border-2 border-dashed rounded-lg p-4 bg-muted/20"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  setDraggedWidget(null);
                  // Handle widget drop logic
                }}
              >
                <div className="grid grid-cols-2 gap-4 h-full">
                  {/* Sample Widgets */}
                  <Card className="h-fit">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$324,567</div>
                      <p className="text-sm text-green-600">+12.3% from last month</p>
                    </CardContent>
                  </Card>

                  <Card className="h-fit">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,547</div>
                      <p className="text-sm text-muted-foreground">Currently online</p>
                    </CardContent>
                  </Card>

                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm">Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sampleChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Device Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              outerRadius={50}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="h-fit">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4.8%</div>
                      <p className="text-sm text-red-600">-0.3% from last week</p>
                    </CardContent>
                  </Card>
                </div>

                {draggedWidget && (
                  <div className="absolute inset-0 bg-blue-50/50 border-2 border-blue-300 border-dashed rounded-lg flex items-center justify-center">
                    <p className="text-blue-700 font-medium">Drop widget here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Widget Library</h2>
            <p className="text-sm text-muted-foreground">Browse and customize available dashboard components</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetTypes.map((widget) => {
              const IconComponent = widget.icon;
              return (
                <Card key={widget.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconComponent className="h-5 w-5" />
                      {widget.name}
                    </CardTitle>
                    <CardDescription>{widget.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                        <IconComponent className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Configuration</Label>
                        <Select>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select data source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sales">Sales Data</SelectItem>
                            <SelectItem value="users">User Analytics</SelectItem>
                            <SelectItem value="models">Model Metrics</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button size="sm" className="w-full">
                        <Plus className="h-3 w-3 mr-1" />
                        Add to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Dashboard Templates</h2>
            <p className="text-sm text-muted-foreground">Start with pre-built dashboard templates</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Executive Overview</CardTitle>
                <CardDescription>High-level business metrics and KPIs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-md p-4">
                  <div className="grid grid-cols-2 gap-2 h-full">
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                      <div className="text-xs text-muted-foreground">Revenue</div>
                      <div className="font-bold">$1.2M</div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                      <div className="text-xs text-muted-foreground">Users</div>
                      <div className="font-bold">45K</div>
                    </div>
                    <div className="col-span-2 bg-white/50 dark:bg-black/20 rounded p-2">
                      <div className="text-xs text-muted-foreground">Growth Chart</div>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Use Template</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ML Operations</CardTitle>
                <CardDescription>Model performance and monitoring dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20 rounded-md p-4">
                  <div className="grid grid-cols-2 gap-2 h-full">
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                      <div className="font-bold">94.2%</div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                      <div className="text-xs text-muted-foreground">Predictions</div>
                      <div className="font-bold">1.2M</div>
                    </div>
                    <div className="col-span-2 bg-white/50 dark:bg-black/20 rounded p-2">
                      <div className="text-xs text-muted-foreground">Model Drift</div>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Use Template</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Analytics</CardTitle>
                <CardDescription>Customer behavior and segmentation insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-md p-4">
                  <div className="grid grid-cols-2 gap-2 h-full">
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                      <div className="text-xs text-muted-foreground">Segments</div>
                      <div className="font-bold">4</div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                      <div className="text-xs text-muted-foreground">LTV</div>
                      <div className="font-bold">$2.1K</div>
                    </div>
                    <div className="col-span-2 bg-white/50 dark:bg-black/20 rounded p-2">
                      <div className="text-xs text-muted-foreground">Cohort Analysis</div>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Use Template</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}