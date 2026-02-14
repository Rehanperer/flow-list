"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Task, Habit, HabitLog } from "@prisma/client";
import { format, subDays, isSameDay } from "date-fns";

interface AnalyticsViewProps {
    tasks: Task[];
    habits: (Habit & { logs: HabitLog[] })[];
}

export const AnalyticsView = ({ tasks, habits }: AnalyticsViewProps) => {
    // 1. Task Completion Rate Data
    const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
    const pendingTasks = tasks.length - completedTasks;
    const taskData = [
        { name: 'Completed', value: completedTasks, color: '#10b981' },
        { name: 'Pending', value: pendingTasks, color: '#e5e7eb' },
    ];

    // 2. Daily Productivity (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const count = tasks.filter(t =>
            t.status === "COMPLETED" &&
            t.updatedAt &&
            isSameDay(new Date(t.updatedAt), date)
        ).length;
        return {
            name: format(date, "EEE"),
            tasks: count,
        };
    });

    // 3. Habit Streaks
    const habitData = habits.map(h => ({
        name: h.title,
        streak: h.streakCurrent,
        color: h.streakCurrent > 5 ? '#f59e0b' : '#3b82f6'
    })).slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Task Completion Pie */}
                <Card className="bg-background/60 backdrop-blur-xl border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                        <CardDescription>Overall productivity ratio</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={taskData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {taskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 text-xs font-medium mt-2">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Done</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-200" /> Pending</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Weekly Productivity Area */}
                <Card className="bg-background/60 backdrop-blur-xl border-none shadow-xl lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                        <CardDescription>Daily task completion trend</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={last7Days}>
                                <defs>
                                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="tasks"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorTasks)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Habit Streaks Bar Chart */}
            <Card className="bg-background/60 backdrop-blur-xl border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Top Habit Streaks</CardTitle>
                    <CardDescription>Your current consistent runs</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={habitData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                            <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={80} />
                            <Tooltip />
                            <Bar dataKey="streak" radius={[0, 4, 4, 0]} barSize={20}>
                                {habitData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};
