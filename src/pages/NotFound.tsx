import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // 404 tracked via location state
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center relative">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link to="/" className="inline-flex items-center gap-1.5 text-primary hover:text-primary/90 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
