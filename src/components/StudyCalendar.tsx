import { useState, useMemo } from "react";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useStudyPlan, PlanItem } from "@/hooks/useStudyPlan";
import { useNavigate } from "react-router-dom";

export function StudyCalendar() {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
    const plan = useStudyPlan();
    const navigate = useNavigate();

    const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    const resetToToday = () => setCurrentWeekStart(startOfWeek(new Date()));

    // Generate days for week
    const weekEnd = endOfWeek(currentWeekStart);
    const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/5">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-heading font-bold text-foreground capitalize flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {format(currentWeekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                    </h2>
                    <Button variant="outline" size="sm" onClick={resetToToday} className="h-6 text-[10px] uppercase font-bold tracking-widest hidden sm:flex">
                        This Week
                    </Button>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={prevWeek} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextWeek} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 min-h-0 bg-background/50">
                {/* Days */}
                {days.map((day, idx) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const item = plan[dateStr];
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "border-r-[3px] border-[hsl(var(--card))] p-1 relative group transition-colors hover:bg-secondary/5 flex flex-col gap-1 min-h-[60px]",
                                isDayToday && "bg-primary/5"
                            )}
                        >
                            {/* Header: Day Name + Number */}
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{format(day, "EEE")}</span>
                                <div className={cn(
                                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                                    isDayToday ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground"
                                )}>
                                    {format(day, "d")}
                                </div>
                            </div>

                            {/* Plan Item Marker */}
                            {item ? (
                                <div
                                    onClick={() => item.topicId && navigate(`/topic/${item.topicId}`)}
                                    className={cn(
                                        "flex-1 p-2 rounded-md border cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-start gap-1",
                                        item.type === "topic" && "bg-blue-500/10 border-blue-500/20 text-blue-700 hover:bg-blue-500/20",
                                        item.type === "mock" && "bg-purple-500/10 border-purple-500/20 text-purple-700 hover:bg-purple-500/20",
                                        item.type === "revision" && "bg-amber-500/10 border-amber-500/20 text-amber-700 hover:bg-amber-500/20",
                                        item.type === "rest" && "bg-green-500/10 border-green-500/20 text-green-700 opacity-70"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-[8px] uppercase tracking-wider opacity-70">{item.type}</span>
                                        {item.priority === "High" && <Star className="h-2 w-2 fill-current" />}
                                    </div>
                                    <div className="font-semibold text-xs leading-tight line-clamp-3 mt-1">
                                        {item.title}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center opacity-30">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">-</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
