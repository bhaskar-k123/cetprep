import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStaticData } from "@/hooks/useStaticData";
import { Brain, BookOpen, Calculator, FileText } from "lucide-react";

const sectionIcons: Record<string, React.ElementType> = {
  LR: Brain,
  AR: BookOpen,
  QA: Calculator,
  VARC: FileText,
};

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const location = useLocation();
  const { sections } = useStaticData();
  const searchParams = new URLSearchParams(location.search);
  const activeSection = searchParams.get("section");

  return (
    <aside
      className={cn(
        "w-64 shrink-0 bg-background border-r border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto",
        className
      )}
    >
      <div className="p-6">
        <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6 opacity-70">
          Curriculum
        </h3>
        <nav className="space-y-1">
          {sections.map((section) => {
            const Icon = sectionIcons[section.id] || BookOpen;
            const isActive = activeSection === section.id;

            return (
              <Link
                key={section.id}
                to={`${location.pathname}?section=${section.id}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 border-l-2 rounded-[var(--radius)]",
                  isActive
                    ? "bg-primary/5 text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className="tracking-wide">{section.id}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
