import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Bell, Mail, MessageSquare, Settings, Activity, CheckCircle, XCircle, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface Alert {
  id: string;
  name: string;
  type: "threshold" | "anomaly" | "drift" | "performance";
  status: "active" | "triggered" | "paused";
  condition: string;
  channel: "email" | "slack" | "webhook";
  lastTriggered: string | null;
  triggerCount: number;
}

interface AlertHistory {
  id: string;
  alertName: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  resolved: boolean;
}

const alerts: Alert[] = [
  {
    id: "1",
    name: "Model Accuracy Drop",
    type: "performance",
    status: "active",
    condition: "Accuracy < 85%",
    channel: "email",
    lastTriggered: "2024-01-14 15:30",
    triggerCount: 3
  },
  {
    id: "2",
    name: "Data Drift Detection",
    type: "drift", 
    status: "triggered",
    condition: "PSI > 0.2",
    channel: "slack",
    lastTriggered: "2024-01-15 09:15",
    triggerCount: 1
  },
  {
    id: "3",
    name: "Prediction Volume Spike",
    type: "anomaly",
    status: "active",
    condition: "Requests > 1000/min",
    channel: "webhook",
    lastTriggered: null,
    triggerCount: 0
  }
];

const alertHistory: AlertHistory[] = [
  {
    id: "1",
    alertName: "Data Drift Detection",
    timestamp: "2024-01-15 09:15",
    severity: "high",
    message: "Significant drift detected in feature 'customer_age' - PSI: 0.25",
    resolved: false
  },
  {
    id: "2",
    alertName: "Model Accuracy Drop",
    timestamp: "2024-01-14 15:30",
    severity: "medium", 
    message: "Customer churn model accuracy dropped to 82.3%",
    resolved: true
  },
  {
    id: "3",
    alertName: "API Response Time",
    timestamp: "2024-01-14 11:20",
    severity: "low",
    message: "Average response time increased to 245ms",
    resolved: true
  }
];

const driftData = [
  { date: "2024-01-01", psi: 0.05, threshold: 0.2 },
  { date: "2024-01-02", psi: 0.07, threshold: 0.2 },
  { date: "2024-01-03", psi: 0.06, threshold: 0.2 },
  { date: "2024-01-04", psi: 0.08, threshold: 0.2 },
  { date: "2024-01-05", psi: 0.12, threshold: 0.2 },
  { date: "2024-01-06", psi: 0.15, threshold: 0.2 },
  { date: "2024-01-07", psi: 0.18, threshold: 0.2 },
  { date: "2024-01-08", psi: 0.25, threshold: 0.2 },
  { date: "2024-01-09", psi: 0.22, threshold: 0.2 },
  { date: "2024-01-10", psi: 0.19, threshold: 0.2 }
];

export default function AlertIQ() {
  const [newAlertType, setNewAlertType] = useState<string>("");

  const getStatusIcon = (status: Alert['status']) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "triggered": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "paused": return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Alert['status']) => {
    const variants = {
      active: "default",
      triggered: "destructive",
      paused: "secondary"
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getTypeColor = (type: Alert['type']) => {
    const colors = {
      threshold: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      anomaly: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300", 
      drift: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      performance: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
    };
    return colors[type];
  };

  const getSeverityBadge = (severity: AlertHistory['severity']) => {
    const variants = {
      low: "secondary",
      medium: "outline",
      high: "default", 
      critical: "destructive"
    } as const;
    
    return <Badge variant={variants[severity]}>{severity}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8 text-primary" />
          AlertIQ
        </h1>
        <p className="text-muted-foreground">Intelligent monitoring, anomaly detection, and automated alerting</p>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="create">Create Alert</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <p className="text-sm text-muted-foreground">Configured alerts</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {alerts.filter(a => a.status === 'active').length}
                </div>
                <p className="text-sm text-muted-foreground">Currently monitoring</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Triggered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.status === 'triggered').length}
                </div>
                <p className="text-sm text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">24h Triggers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-sm text-muted-foreground">Past 24 hours</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(alert.status)}
                        <h3 className="font-semibold">{alert.name}</h3>
                        {getStatusBadge(alert.status)}
                        <Badge className={getTypeColor(alert.type)} variant="outline">
                          {alert.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>Condition: {alert.condition}</span>
                        <span>Channel: {alert.channel}</span>
                        <span>Triggers: {alert.triggerCount}</span>
                        {alert.lastTriggered && (
                          <span>Last: {alert.lastTriggered}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={alert.status !== 'paused'} />
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

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Alert Activity
              </CardTitle>
              <CardDescription>
                Historical record of triggered alerts and their resolution status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertHistory.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{entry.alertName}</h4>
                        {getSeverityBadge(entry.severity)}
                        {entry.resolved ? (
                          <Badge variant="outline" className="text-green-600">Resolved</Badge>
                        ) : (
                          <Badge variant="destructive">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.message}</p>
                      <div className="text-xs text-muted-foreground">{entry.timestamp}</div>
                    </div>
                    <div className="flex gap-2">
                      {!entry.resolved && (
                        <Button size="sm" variant="outline">
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Data Drift Monitoring
              </CardTitle>
              <CardDescription>
                Real-time population stability index (PSI) tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={driftData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 0.3]} />
                    <Tooltip />
                    <ReferenceLine 
                      y={0.2} 
                      stroke="hsl(var(--destructive))" 
                      strokeDasharray="5 5"
                      label="Alert Threshold"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="psi" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="PSI Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Alert</CardTitle>
              <CardDescription>
                Set up intelligent monitoring and alerting for your ML models and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Alert Name</Label>
                  <Input placeholder="e.g., Revenue Anomaly Detection" />
                </div>
                <div className="space-y-2">
                  <Label>Alert Type</Label>
                  <Select value={newAlertType} onValueChange={setNewAlertType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="threshold">Threshold Alert</SelectItem>
                      <SelectItem value="anomaly">Anomaly Detection</SelectItem>
                      <SelectItem value="drift">Data Drift</SelectItem>
                      <SelectItem value="performance">Model Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newAlertType === "threshold" && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Metric</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accuracy">Model Accuracy</SelectItem>
                        <SelectItem value="response_time">Response Time</SelectItem>
                        <SelectItem value="request_count">Request Count</SelectItem>
                        <SelectItem value="error_rate">Error Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gt">Greater than</SelectItem>
                        <SelectItem value="lt">Less than</SelectItem>
                        <SelectItem value="eq">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Threshold Value</Label>
                    <Input placeholder="e.g., 0.85, 500" />
                  </div>
                </div>
              )}

              {newAlertType === "drift" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Source</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production Data</SelectItem>
                        <SelectItem value="training">Training Dataset</SelectItem>
                        <SelectItem value="validation">Validation Set</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>PSI Threshold</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Drift sensitivity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.1">0.1 (High sensitivity)</SelectItem>
                        <SelectItem value="0.2">0.2 (Medium sensitivity)</SelectItem>
                        <SelectItem value="0.25">0.25 (Low sensitivity)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Notification Channels</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="font-medium">Email</span>
                      </div>
                      <Switch />
                    </div>
                    <Input placeholder="admin@company.com" className="text-sm" />
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">Slack</span>
                      </div>
                      <Switch />
                    </div>
                    <Input placeholder="#alerts" className="text-sm" />
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="font-medium">Webhook</span>
                      </div>
                      <Switch />
                    </div>
                    <Input placeholder="https://api.company.com/alerts" className="text-sm" />
                  </Card>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Create Alert Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}