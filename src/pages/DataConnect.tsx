import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Database, Cloud, FileSpreadsheet, Link2, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Dataset {
  id: string;
  name: string;
  source: string;
  rows: number;
  columns: number;
  size: string;
  uploadedAt: string;
  status: "processing" | "ready" | "error";
}

export default function DataConnect() {
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: "1",
      name: "customer_analytics.csv",
      source: "Upload",
      rows: 15420,
      columns: 12,
      size: "2.3 MB",
      uploadedAt: "2024-01-15",
      status: "ready"
    },
    {
      id: "2", 
      name: "sales_forecast_data",
      source: "BigQuery",
      rows: 45120,
      columns: 8,
      size: "12.1 MB",
      uploadedAt: "2024-01-14",
      status: "ready"
    }
  ]);

  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Upload Started",
        description: `Uploading ${file.name}...`,
      });
      // Simulate upload
      setTimeout(() => {
        const newDataset: Dataset = {
          id: Date.now().toString(),
          name: file.name,
          source: "Upload",
          rows: Math.floor(Math.random() * 50000) + 1000,
          columns: Math.floor(Math.random() * 20) + 5,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadedAt: new Date().toISOString().split('T')[0],
          status: "ready"
        };
        setDatasets(prev => [newDataset, ...prev]);
        toast({
          title: "Upload Complete",
          description: `${file.name} has been processed and is ready for analysis.`,
        });
      }, 2000);
    }
  };

  const getStatusBadge = (status: Dataset['status']) => {
    const variants = {
      processing: "secondary",
      ready: "default", 
      error: "destructive"
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">DataConnect Pro</h1>
        <p className="text-muted-foreground">Connect, upload, and manage your datasets from multiple sources</p>
      </div>

      <Tabs defaultValue="datasets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="datasets">My Datasets</TabsTrigger>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
          <TabsTrigger value="connectors">Data Connectors</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-4">
          <div className="grid gap-4">
            {datasets.map((dataset) => (
              <Card key={dataset.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{dataset.name}</h3>
                        {getStatusBadge(dataset.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Database className="h-4 w-4" />
                          {dataset.rows.toLocaleString()} rows
                        </span>
                        <span>{dataset.columns} columns</span>
                        <span>{dataset.size}</span>
                        <span>Source: {dataset.source}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Dataset</CardTitle>
              <CardDescription>
                Upload CSV, JSON, or Parquet files. Maximum file size: 500MB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <h3 className="font-semibold">Drop files here or click to browse</h3>
                  <p className="text-sm text-muted-foreground">
                    Supports CSV, JSON, Parquet formats
                  </p>
                </div>
                <Input
                  type="file"
                  className="mt-4 cursor-pointer"
                  accept=".csv,.json,.parquet"
                  onChange={handleFileUpload}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connectors" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Amazon S3
                </CardTitle>
                <CardDescription>Connect to your S3 buckets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bucket Name</Label>
                  <Input placeholder="my-data-bucket" />
                </div>
                <div className="space-y-2">
                  <Label>Access Key ID</Label>
                  <Input type="password" placeholder="Enter access key" />
                </div>
                <Button className="w-full">
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect S3
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Google Sheets
                </CardTitle>
                <CardDescription>Import data from Google Sheets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sheet URL</Label>
                  <Input placeholder="https://docs.google.com/spreadsheets/d/..." />
                </div>
                <div className="space-y-2">
                  <Label>Sheet Name</Label>
                  <Input placeholder="Sheet1" />
                </div>
                <Button className="w-full">
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect Sheets
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  BigQuery
                </CardTitle>
                <CardDescription>Query data from BigQuery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project ID</Label>
                  <Input placeholder="my-gcp-project" />
                </div>
                <div className="space-y-2">
                  <Label>Service Account JSON</Label>
                  <Input type="file" accept=".json" />
                </div>
                <Button className="w-full">
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect BigQuery
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}