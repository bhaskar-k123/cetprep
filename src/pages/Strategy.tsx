import { useState } from "react";
import { useStaticData } from "@/hooks/useStaticData";
import { cn } from "@/lib/utils";

export default function Strategy() {
    const { sections, strategies } = useStaticData();
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    // Get general strategy + section-specific strategies
    const generalStrategy = strategies.find((s) => s.section_id === null);
    const sectionStrategies = selectedSection
        ? strategies.filter((s) => s.section_id === selectedSection)
        : [];

    const displayStrategies = selectedSection
        ? sectionStrategies
        : generalStrategy
            ? [generalStrategy]
            : [];

    // Combine all content into one view for "Newspaper" feel
    // or just show the first one if multiple (rare for this data structure)
    const activeStrategy = displayStrategies[0];

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Header Area */}
            <div className="flex-none border-b border-border pb-4 min-h-[100px] flex flex-col justify-end">
                <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">Strategy & Academic Guidance</h1>
                <p className="text-lg text-muted-foreground mt-1 font-sans italic">
                    Methodological approaches and strategic insights.
                </p>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 flex flex-col gap-6">
                {/* Section Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto p-1 no-scrollbar flex-none">
                    <button
                        onClick={() => setSelectedSection(null)}
                        className={cn(
                            "px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all flex-shrink-0 border",
                            selectedSection === null
                                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
                        )}
                    >
                        General Overview
                    </button>
                    {sections.filter(s => s.id !== "MOCKS").map(section => (
                        <button
                            key={section.id}
                            onClick={() => setSelectedSection(section.id)}
                            className={cn(
                                "px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all flex-shrink-0 border",
                                selectedSection === section.id
                                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                    : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            {section.name}
                        </button>
                    ))}
                </div>

                {/* Newspaper Layout Container */}
                <div className="flex-1 min-h-0 bg-background border border-border rounded-xl p-8 overflow-hidden">
                    {activeStrategy ? (
                        <div className="h-full flex flex-col">
                            <h2 className="text-3xl font-heading font-bold text-foreground border-b border-border pb-4 mb-6 flex-none">
                                {activeStrategy.title}
                            </h2>

                            {/* Multi-Column Text Content */}
                            <div className="flex-1 min-h-0">
                                {/* We use columns-3 to spread content. overflow-y-auto is a fallback if it REALLY exceeds, but user wants fit. */}
                                <div className="columns-1 md:columns-2 lg:columns-3 gap-12 h-full [column-fill:auto] text-justify prose prose-sm max-w-none">
                                    {/* Reduced font size for high density */}
                                    {activeStrategy.content.split("\n").map((line, i) => {
                                        if (line.startsWith("## ")) return <h3 key={i} className="break-inside-avoid-column text-xl font-heading font-bold mb-3 mt-6 text-primary first:mt-0">{line.replace("## ", "")}</h3>;
                                        if (line.startsWith("### ")) return <h4 key={i} className="break-inside-avoid-column text-lg font-bold mb-2 mt-4">{line.replace("### ", "")}</h4>;
                                        if (line.startsWith("- ")) {
                                            return (
                                                <div key={i} className="flex gap-2 mb-2 items-start break-inside-avoid-column">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                                    <p className="text-sm text-muted-foreground leading-relaxed">{line.replace("- ", "")}</p>
                                                </div>
                                            )
                                        }
                                        if (line.match(/^\d+\./)) {
                                            return (
                                                <div key={i} className="flex gap-2 mb-2 items-start break-inside-avoid-column">
                                                    <span className="text-primary font-bold text-sm">{line.match(/^\d+/)?.[0]}</span>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">{line.replace(/^\d+\.\s*/, "")}</p>
                                                </div>
                                            )
                                        }
                                        if (line.trim() === "") return <div key={i} className="h-2" />;
                                        return <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">{line}</p>;
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-center p-20">
                            <p className="text-muted-foreground italic font-sans text-lg">Select a section to view strategic guidance.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
