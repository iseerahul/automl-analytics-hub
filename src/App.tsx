import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Overview from "./pages/Overview";
import QuickInsights from "./pages/QuickInsights";
import DataConnect from "./pages/DataConnect";
import InsightAI from "./pages/InsightAI";
import ForecastPro from "./pages/ForecastPro";
import SegmentAI from "./pages/SegmentAI";
import RecommendPro from "./pages/RecommendPro";
import AlertIQ from "./pages/AlertIQ";
import DashboardStudio from "./pages/DashboardStudio";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/quick-insights" element={<QuickInsights />} />
            <Route path="/dataconnect" element={<DataConnect />} />
            <Route path="/insight-ai" element={<InsightAI />} />
            <Route path="/forecast-pro" element={<ForecastPro />} />
            <Route path="/segment-ai" element={<SegmentAI />} />
            <Route path="/recommend-pro" element={<RecommendPro />} />
            <Route path="/alert-iq" element={<AlertIQ />} />
            <Route path="/dashboard-studio" element={<DashboardStudio />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
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
