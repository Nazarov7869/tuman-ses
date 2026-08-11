import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import MainAdmin from "./pages/admin/MainAdmin";
import QabulAdmin from "./pages/admin/QabulAdmin";
import PaymentAdmin from "./pages/admin/PaymentAdmin";
import RegistrantsAdmin from "./pages/admin/RegistrantsAdmin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Redirects to /login whenever api.ts gives up refreshing an expired session.
const AuthLogoutListener = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const onLogout = () => navigate("/login", { replace: true });
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [navigate]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthLogoutListener />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="main">
                <MainAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/main"
            element={
              <ProtectedRoute requiredRole="main">
                <MainAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/qabul"
            element={
              <ProtectedRoute requiredRole="qabul">
                <QabulAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payment"
            element={
              <ProtectedRoute requiredRole="payment">
                <PaymentAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/registrants"
            element={
              <ProtectedRoute requiredRole="registrants">
                <RegistrantsAdmin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
