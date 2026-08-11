import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getMe } from "@/lib/authApi";
import { getAccessToken, clearTokens } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { logError } from "@/lib/logger";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "main" | "qabul" | "payment" | "registrants";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    if (!getAccessToken()) {
      setLoading(false);
      return;
    }

    getMe()
      .then((me) => {
        if (cancelled) return;
        setAuthenticated(true);
        setUserRole(me.role);
        if (me.role) localStorage.setItem("adminRole", me.role);
        localStorage.setItem("adminEmail", me.email);
      })
      .catch((error) => {
        logError("Error fetching current user:", error);
        clearTokens();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but no admin role - redirect to home
  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  // Check if user has the required role (main admin can access everything)
  if (requiredRole && userRole !== requiredRole && userRole !== "main") {
    return <Navigate to={`/admin/${userRole}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
