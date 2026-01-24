import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background p-10">
      <div className="text-center max-w-xl academic-card p-16 border-dashed border-2">
        <h1 className="mb-6 text-9xl font-heading font-bold tracking-tighter text-primary/20">404</h1>
        <p className="mb-4 text-2xl font-heading font-bold text-foreground">Resource Not Found</p>
        <p className="mb-10 text-lg text-muted-foreground font-sans italic leading-relaxed">
          The scholarly record you are searching for does not exist in our current curriculum. It may have been archived or relocated.
        </p>
        <Button asChild className="btn-academic-primary px-10">
          <Link to="/">
            Return to Academy Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
