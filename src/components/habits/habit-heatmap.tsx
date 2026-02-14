"use client";

import { useMemo } from "react";
import { HabitLog } from "@prisma/client";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HabitHeatmapProps {
    logs: HabitLog[];
}

export const HabitHeatmap = ({ logs }: HabitHeatmapProps) => {
    const days = useMemo(() => {
        const today = startOfDay(new Date());
        return Array.from({ length: 90 }, (_, i) => subDays(today, 89 - i));
    }, []);

    const getLogCount = (date: Date) => {
        return logs.filter((log) => isSameDay(new Date(log.completedAt), date)).length;
    };

    return (
        <Card className="mt-8 overflow-hidden">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    Activity Overview (Last 90 Days)
                    <div className="flex gap-1 text-[10px] items-center text-muted-foreground font-normal">
                        <span>Less</span>
                        <div className="w-2 h-2 rounded-sm bg-muted" />
                        <div className="w-2 h-2 rounded-sm bg-emerald-200" />
                        <div className="w-2 h-2 rounded-sm bg-emerald-400" />
                        <div className="w-2 h-2 rounded-sm bg-emerald-600" />
                        <span>More</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <TooltipProvider>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                        {days.map((day) => {
                            const count = getLogCount(day);
                            const dateStr = format(day, "PPP");

                            return (
                                <Tooltip key={day.toISOString()}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "w-3 h-3 md:w-4 md:h-4 rounded-sm transition-colors border border-black/5",
                                                count === 0 && "bg-muted",
                                                count === 1 && "bg-emerald-200",
                                                count === 2 && "bg-emerald-400",
                                                count >= 3 && "bg-emerald-600"
                                            )}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">
                                            {count} {count === 1 ? 'completion' : 'completions'} on {dateStr}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
};
