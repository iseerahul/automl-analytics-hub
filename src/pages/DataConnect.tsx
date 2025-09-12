import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Database, Cloud, FileSpreadsheet, Link2, Trash2, Eye, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Dataset {
  id: string;
  name: string;
  source: string;
  rows: number;
  columns: number;
  size_bytes: number;
  file_path: string | null;
  created_at: string;
  status: string;
  user_id: string;
  updated_at: string;
}

interface DataConnector {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
  config: any;
  user_id: string;
  updated_at: string;
}

export default function DataConnect() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [connectors, setConnectors] = useState<DataConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load datasets from Supabase
  useEffect(() => {
    if (user) {
      loadDatasets();
      loadConnectors();
    }
  }, [user]);

  const loadDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDatasets(data || []);
    } catch (error) {
      console.error('Error loading datasets:', error);
      toast({
        title: "Error",
        description: "Failed to load datasets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConnectors = async () => {
    try {
      const { data, error } = await supabase
        .from('data_connectors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnectors(data || []);
    } catch (error) {
      console.error('Error loading connectors:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    toast({
      title: "Upload Started",
      description: `Uploading ${file.name}...`,
    });

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create dataset record
      const { data: dataset, error: dbError } = await supabase
        .from('datasets')
        .insert({
          user_id: user.id,
          name: file.name,
          source: "Upload",
          file_path: uploadData.path,
          size_bytes: file.size,
          rows: Math.floor(Math.random() * 50000) + 1000, // In real app, parse file
          columns: Math.floor(Math.random() * 20) + 5, // In real app, parse file
          status: "ready"
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setDatasets(prev => [dataset, ...prev]);
      toast({
        title: "Upload Complete",
        description: `${file.name} has been processed and is ready for analysis.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      processing: "secondary",
      ready: "default", 
      error: "destructive"
    };
    
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteDataset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('datasets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDatasets(prev => prev.filter(d => d.id !== id));
      toast({
        title: "Dataset Deleted",
        description: "Dataset has been successfully deleted.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete dataset. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleConnectorSubmit = async (type: string) => {
    if (!user) return;

    try {
      const response = await supabase.functions.invoke('data-connectors', {
        body: {
          action: 'create',
          connectorType: type,
          config: {}, // In real app, collect form data
          name: `${type.toUpperCase()} Connection`
        }
      });

      if (response.error) throw response.error;

      const connectorId = response.data?.connector?.id as string | undefined;
      if (connectorId) {
        const syncRes = await supabase.functions.invoke('data-connectors', {
          body: { action: 'sync', connectorId }
        });
        if (syncRes.error) throw syncRes.error;
      }

      toast({
        title: "Connector Ready",
        description: connectorId
          ? `${type.toUpperCase()} connected and data synced to My Datasets.`
          : `${type.toUpperCase()} connector has been set up successfully.`,
      });

      // Refresh lists
      loadConnectors();
      loadDatasets();
    } catch (error) {
      console.error('Connector creation/sync error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to create or sync connector. Please check your credentials.",
        variant: "destructive"
      });
    }
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading datasets...</span>
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No datasets yet</h3>
              <p className="text-muted-foreground">Upload your first dataset to get started</p>
            </div>
          ) : (
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
                        <span>{formatFileSize(dataset.size_bytes)}</span>
                        <span>Source: {dataset.source}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteDataset(dataset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
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
                  disabled={uploading}
                />
                {uploading && (
                  <div className="flex items-center justify-center mt-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
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
                <Button 
                  className="w-full"
                  onClick={() => handleConnectorSubmit('s3')}
                >
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
                <Button 
                  className="w-full"
                  onClick={() => handleConnectorSubmit('google_sheets')}
                >
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
                <Button 
                  className="w-full"
                  onClick={() => handleConnectorSubmit('bigquery')}
                >
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