import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppLayout } from "@/components/AppLayout";
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Syllabus = React.lazy(() => import("./pages/Syllabus"));
const TopicDetail = React.lazy(() => import("./pages/TopicDetail"));
const PracticeIndex = React.lazy(() => import("./pages/PracticeIndex"));
const Practice = React.lazy(() => import("./pages/Practice"));
const Strategy = React.lazy(() => import("./pages/Strategy"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <React.Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/syllabus" element={<Syllabus />} />
                <Route path="/topic/:topicId" element={<TopicDetail />} />
                <Route path="/practice" element={<PracticeIndex />} />
                <Route path="/practice/:topicId" element={<Practice />} />
                <Route path="/strategy" element={<Strategy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
