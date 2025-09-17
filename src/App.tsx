import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import LandingPage from "./pages/LandingPage";
// Removed: Overview, QuickInsights
import DataConnect from "./pages/DataConnect";
import MLStudio from "./pages/MLStudio";
import ForecastPro from "./pages/ForecastPro";
import SegmentAI from "./pages/SegmentAI";
import RecommendPro from "./pages/RecommendPro";
// Removed: AlertIQ
import DashboardStudio from "./pages/DashboardStudio";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<LandingPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<MLStudio />} />
                    <Route path="/dataconnect" element={<DataConnect />} />
                    <Route path="/insight-ai" element={<MLStudio />} />
                    <Route path="/forecast-pro" element={<ForecastPro />} />
                    <Route path="/segment-ai" element={<SegmentAI />} />
                    <Route path="/recommend-pro" element={<RecommendPro />} />
                    <Route path="/dashboard-studio" element={<DashboardStudio />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Temporary Coming Soon component for unimplemented pages
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-muted-foreground">{title}</h1>
        <p className="text-lg text-muted-foreground">Coming Soon</p>
        <p className="text-sm text-muted-foreground max-w-md">
          This powerful AI feature is currently in development. 
          Check back soon for advanced {title.toLowerCase()} capabilities.
        </p>
      </div>
    </div>
  );
}

export default App;
