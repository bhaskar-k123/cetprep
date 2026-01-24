import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Syllabus from "./pages/Syllabus";
import TopicDetail from "./pages/TopicDetail";
import PracticeIndex from "./pages/PracticeIndex";
import Practice from "./pages/Practice";
import Strategy from "./pages/Strategy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/syllabus" element={<Syllabus />} />
              <Route path="/topic/:topicId" element={<TopicDetail />} />
              <Route path="/practice" element={<PracticeIndex />} />
              <Route path="/practice/:topicId" element={<Practice />} />
              <Route path="/strategy" element={<Strategy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
