import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, Play, Lightbulb, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/syllabus", label: "Syllabus", icon: BookOpen },
  { path: "/practice", label: "Practice", icon: Play },
  { path: "/strategy", label: "Strategy", icon: Lightbulb },
];

export function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto px-4 md:px-6 flex h-12 items-center">
        <div className="mr-8">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-heading font-bold text-2xl tracking-tight text-primary">CET Prep</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "inline-flex items-center gap-3 px-4 py-2 text-sm font-semibold transition-all duration-200 border-b-2 rounded-[var(--radius)]",
                  isActive
                    ? "text-primary border-primary bg-primary/5"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
