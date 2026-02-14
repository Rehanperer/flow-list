import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckSquare, Repeat, Zap, Flame, PlusCircle, Calendar, ArrowRight, BarChart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [taskCount, habitCount, totalStreaks, recentTasks] = await Promise.all([
        db.task.count({ where: { userId: session.user.id, status: "TODO" } }),
        db.habit.count({ where: { userId: session.user.id } }),
        db.habit.aggregate({ where: { userId: session.user.id }, _sum: { streakCurrent: true } }),
        db.task.findMany({ where: { userId: session.user.id, status: "TODO" }, take: 3, orderBy: { createdAt: 'desc' } })
    ]);

    const stats = [
        {
            title: "Tasks To-Do",
            value: taskCount,
            icon: CheckSquare,
            color: "text-violet-500",
            bg: "bg-violet-500/10"
        },
        {
            title: "Active Habits",
            value: habitCount,
            icon: Repeat,
            color: "text-pink-700",
            bg: "bg-pink-700/10"
        },
        {
            title: "Total Streaks",
            value: totalStreaks._sum.streakCurrent || 0,
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            title: "Flow State",
            value: "Active",
            icon: Zap,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Focus on what matters.</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Good evening, {session.user.name?.split(' ')[0] ?? 'User'}. Here&apos;s your flow for today.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/analytics">
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all cursor-pointer">
                            <BarChart className="w-4 h-4" />
                            Insights
                        </div>
                    </Link>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={stat.title} className="bg-background/60 backdrop-blur-xl border-none shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-primary" />
                        Quick Entry
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        <Link href="/tasks">
                            <Card className="hover:bg-primary/5 cursor-pointer transition-colors border-dashed border-2">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <span className="font-medium">New Task</span>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/habits">
                            <Card className="hover:bg-primary/5 cursor-pointer transition-colors border-dashed border-2">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <span className="font-medium">Build Habit</span>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/calendar">
                            <Card className="hover:bg-primary/5 cursor-pointer transition-colors border-dashed border-2">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <span className="font-medium">Calendar View</span>
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* Focus Card & Recent */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap className="w-32 h-32" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Try the AI Focus Mode</CardTitle>
                            <CardDescription className="text-indigo-100 text-lg">
                                Manage your entire day with natural language commands.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/focus">
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-all cursor-pointer">
                                    Launch AI Assistant
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </Link>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Upcoming Priorities</h2>
                        <div className="space-y-3">
                            {recentTasks.length > 0 ? recentTasks.map(task => (
                                <div key={task.id} className="p-4 bg-background/50 border rounded-xl flex items-center justify-between">
                                    <span className="font-medium">{task.title}</span>
                                    <div className="px-2 py-1 bg-violet-100 text-violet-700 text-[10px] font-bold rounded uppercase tracking-tighter italic">
                                        {task.status}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-muted-foreground italic">No pending tasks for now. Enjoy the flow!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
