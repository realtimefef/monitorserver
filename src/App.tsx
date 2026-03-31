// Monitor Server Frontend
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TimezoneProvider } from "@/contexts/TimezoneContext";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Page loader for Suspense fallback
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// Lazy-loaded pages — enables code splitting for faster initial load
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const EmailVerificationSent = lazy(() => import("./pages/EmailVerificationSent"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Servers = lazy(() => import("./pages/Servers"));
const AddServer = lazy(() => import("./pages/AddServer"));
const BulkImport = lazy(() => import("./pages/BulkImport"));
const ServerDetail = lazy(() => import("./pages/ServerDetail"));
const EditServer = lazy(() => import("./pages/EditServer"));
const Alerts = lazy(() => import("./pages/Alerts"));
const AlertRules = lazy(() => import("./pages/AlertRules"));
const History = lazy(() => import("./pages/History"));
const ScheduledReports = lazy(() => import("./pages/ScheduledReports"));
const Settings = lazy(() => import("./pages/Settings"));

const Status = lazy(() => import("./pages/Status"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Features = lazy(() => import("./pages/Features"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Trial = lazy(() => import("./pages/Trial"));
const HelpSupport = lazy(() => import("./pages/HelpSupport"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));

const Documentation = lazy(() => import("./pages/docs/Documentation"));
const GettingStarted = lazy(() => import("./pages/docs/GettingStarted"));
const CoreFeatures = lazy(() => import("./pages/docs/CoreFeatures"));
const APIReference = lazy(() => import("./pages/docs/APIReference"));
const SecurityCompliance = lazy(() => import("./pages/docs/SecurityCompliance"));

const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public / marketing */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/email-sent" element={<EmailVerificationSent />} />

      {/* Protected app routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/servers" element={<ProtectedRoute><Servers /></ProtectedRoute>} />
      <Route path="/servers/new" element={<ProtectedRoute><AddServer /></ProtectedRoute>} />
      <Route path="/servers/import" element={<ProtectedRoute><BulkImport /></ProtectedRoute>} />
      <Route path="/servers/:id" element={<ProtectedRoute><ServerDetail /></ProtectedRoute>} />
      <Route path="/servers/:id/edit" element={<ProtectedRoute><EditServer /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
      <Route path="/rules" element={<ProtectedRoute><AlertRules /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ScheduledReports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Public info pages */}
      <Route path="/status" element={<Status />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/trial" element={<Trial />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/help" element={<HelpSupport />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookies" element={<Cookies />} />

      {/* Documentation with nested layout */}
      <Route path="/docs" element={<Documentation />}>
        <Route path="getting-started" element={<GettingStarted />} />
        <Route path="core-features" element={<CoreFeatures />} />
        <Route path="api-reference" element={<APIReference />} />
        <Route path="security" element={<SecurityCompliance />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AnimatedBackground />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <TimezoneProvider>
                <AppRoutes />
              </TimezoneProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
