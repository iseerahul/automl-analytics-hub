import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Overview from "./pages/Overview";
import QuickInsights from "./pages/QuickInsights";
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
            <Route path="/dataconnect" element={<ComingSoon title="DataConnect Pro" />} />
            <Route path="/insight-ai" element={<ComingSoon title="InsightAI" />} />
            <Route path="/forecast-pro" element={<ComingSoon title="ForecastPro" />} />
            <Route path="/segment-ai" element={<ComingSoon title="SegmentAI" />} />
            <Route path="/recommend-pro" element={<ComingSoon title="RecommendPro" />} />
            <Route path="/alert-iq" element={<ComingSoon title="AlertIQ" />} />
            <Route path="/dashboard-studio" element={<ComingSoon title="DashboardStudio" />} />
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
