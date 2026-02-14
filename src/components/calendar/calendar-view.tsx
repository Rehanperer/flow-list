"use client";

import { useState } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Task, Habit } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";

interface CalendarViewProps {
    tasks: Task[];
    habits: Habit[];
}

export const CalendarView = ({ tasks, habits }: CalendarViewProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-4 py-4 border-b">
                <h2 className="text-xl font-bold text-foreground capitalize">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return (
            <div className="grid grid-cols-7 border-b bg-muted/30">
                {days.map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-semibold uppercase text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="grid grid-cols-7 divide-x divide-y border-b border-l overflow-hidden bg-muted/20">
                {days.map((day) => {
                    const dayTasks = tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day));
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[100px] md:min-h-[120px] p-1 md:p-2 transition-colors hover:bg-muted/50 group relative",
                                !isCurrentMonth ? "bg-muted/5 text-muted-foreground/50" : "bg-background"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn(
                                    "text-xs md:text-sm font-medium w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full leading-none",
                                    isToday ? "bg-primary text-primary-foreground shadow-md" : ""
                                )}>
                                    {format(day, dateFormat)}
                                </span>
                                <CreateTaskModal
                                    defaultValues={{ dueDate: format(day, "yyyy-MM-dd") }}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                            aria-label={`Add task for ${format(day, "PPP")}`}
                                        >
                                            <Plus className="w-3 h-3 text-muted-foreground" />
                                        </Button>
                                    }
                                />
                            </div>
                            <div className="space-y-0.5 md:space-y-1">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            "text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded-sm truncate border shadow-sm transition-all",
                                            task.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-100 line-through opacity-60" : "bg-sky-50 text-sky-700 border-sky-100"
                                        )}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Card className="shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </Card>
    );
};
