import { getSavingsGoals } from "@/actions/finance-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Target,
    ArrowLeft,
    Plus,
    Calendar,
    Trophy,
    TrendingUp,
    ChevronRight,
    Star
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function GoalsPage() {
    const goals = await getSavingsGoals();

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 pb-32">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/finance">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Target className="w-6 h-6 text-emerald-500" />
                            Savings Goals
                        </h1>
                        <p className="text-sm text-muted-foreground">Dream big, save smart, and reach your milestones.</p>
                    </div>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6">
                    <Plus className="w-4 h-4 mr-2" /> New Goal
                </Button>
            </header>

            {/* Total Goals Progress */}
            <Card className="border-none bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-2xl p-8 rounded-[2rem] overflow-hidden relative">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-100/70 text-xs font-bold uppercase tracking-widest">
                            <Trophy className="w-4 h-4" /> Global Milestone Progress
                        </div>
                        <h2 className="text-5xl font-black tabular-nums">72%</h2>
                        <p className="text-emerald-100/60 text-xs">Overall progress across all active goals.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                            <p className="text-emerald-100/50 text-[10px] font-bold uppercase mb-1">Total Saved</p>
                            <p className="text-xl font-bold">$12,400</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                            <p className="text-emerald-100/50 text-[10px] font-bold uppercase mb-1">Total Target</p>
                            <p className="text-xl font-bold">$18,000</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.length === 0 ? (
                    <div className="col-span-full text-center py-24 bg-white/30 dark:bg-black/30 rounded-[2.5rem] border-2 border-dashed border-white/20">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-10 h-10 text-emerald-500 opacity-20" />
                        </div>
                        <h3 className="text-xl font-bold">No Goals Yet</h3>
                        <p className="text-muted-foreground text-sm mt-1 mb-6">Start your journey to financial freedom.</p>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8">Create My First Goal</Button>
                    </div>
                ) : (
                    goals.map((goal) => {
                        const percent = (goal.current / goal.target) * 100;
                        return (
                            <Card key={goal.id} className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-xl rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all">
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                <Star className="w-6 h-6 fill-emerald-500/10" />
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-lg">{goal.name}</h3>
                                                {goal.deadline && (
                                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                                        <Calendar className="w-3 h-3" /> By {format(new Date(goal.deadline), "MMM yyyy")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-emerald-600 tabular-nums">{Math.floor(percent)}%</div>
                                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Complete</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner flex">
                                            <div
                                                className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter text-muted-foreground">
                                            <span>${goal.current.toLocaleString()} saved</span>
                                            <span>Goal: ${goal.target.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-white/10">
                                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600/80">
                                            <TrendingUp className="w-4 h-4" />
                                            Predict: Done in 4 months
                                        </div>
                                        <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs font-bold">Add Funds <Plus className="w-3 h-3 ml-2" /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    );
}
