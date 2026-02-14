import { getBudgets, getTransactions, getBalanceStatus } from "@/actions/finance-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    PieChart,
    ArrowLeft,
    Plus,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function BudgetsPage() {
    // Current month/year
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await getBudgets(month, year);
    const transactions = await getTransactions();
    const { expenses: totalExpenses } = await getBalanceStatus();

    // Calculate category spending
    const categorySpending = transactions
        .filter(t => t.type === "EXPENSE" && new Date(t.date).getMonth() + 1 === month)
        .reduce((acc: Record<string, number>, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

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
                            <PieChart className="w-6 h-6 text-purple-500" />
                            Budgets
                        </h1>
                        <p className="text-sm text-muted-foreground">Track your spending limits and save more.</p>
                    </div>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 px-6">
                    <Plus className="w-4 h-4 mr-2" /> Set Budget
                </Button>
            </header>

            {/* Monthly Progress Card */}
            <Card className="border-none bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-2xl p-6 rounded-[2rem]">
                <CardContent className="p-0 space-y-6">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-purple-100/70 text-xs font-bold uppercase tracking-widest">Total Monthly Spending</p>
                            <h2 className="text-4xl font-black">${totalExpenses.toLocaleString()}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-purple-100/70 text-[10px] font-bold uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                                <TrendingUp className="w-3 h-3 text-emerald-400" /> On Track
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-white h-full transition-all duration-1000"
                            style={{ width: `${Math.min((totalExpenses / 5000) * 100, 100)}%` }} // 5000 as a placeholder limit
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-purple-100/50 uppercase tracking-widest">
                        <span>$0 Spent</span>
                        <span>$5,000 Total Limit</span>
                    </div>
                </CardContent>
            </Card>

            {/* Category Budgets */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center justify-between px-1">
                    Category Breakdown
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">View All <ChevronRight className="w-3 h-3 ml-1" /></Button>
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {budgets.length === 0 ? (
                        <div className="text-center py-12 bg-white/30 dark:bg-black/30 rounded-3xl border border-white/10 text-muted-foreground text-sm">
                            No budgets set for this month.
                            <Link href="#" className="text-purple-600 font-bold ml-1 hover:underline">Create one now.</Link>
                        </div>
                    ) : (
                        budgets.map((b) => {
                            const spent = categorySpending[b.category] || 0;
                            const percent = (spent / b.limit) * 100;
                            const isExceeded = spent > b.limit;

                            return (
                                <Card key={b.id} className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-sm rounded-3xl overflow-hidden group hover:scale-[1.01] transition-all">
                                    <div className="p-5 flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-2xl flex items-center justify-center",
                                                    isExceeded ? "bg-rose-500/10 text-rose-600" : "bg-purple-500/10 text-purple-600"
                                                )}>
                                                    <PieChart className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold flex items-center gap-2">
                                                        {b.category}
                                                        {percent >= 90 && (
                                                            <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase", isExceeded ? "bg-rose-500 text-white" : "bg-orange-400 text-white")}>
                                                                {isExceeded ? "Alert" : "Warning"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tabular-nums">
                                                        ${spent.toLocaleString()} / <span className="text-slate-400">${b.limit.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={cn("text-xl font-black tabular-nums", isExceeded ? "text-rose-500" : "text-slate-800 dark:text-slate-200")}>
                                                    {Math.floor(percent)}%
                                                </div>
                                                <div className="text-[10px] text-muted-foreground font-bold tracking-tighter uppercase">Used</div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    isExceeded ? "bg-rose-500" : percent > 80 ? "bg-orange-400" : "bg-purple-500"
                                                )}
                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Savings Goals Widget (Teaser) */}
            <Card className="border-emerald-500/20 bg-emerald-500/5 rounded-3xl p-6 border-dashed">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold">Next Milestone</h4>
                            <p className="text-xs text-muted-foreground">You&apos;re $300 away from your &quot;Emergency Fund&quot; goal.</p>
                        </div>
                    </div>
                    <Link href="/finance/goals">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs">View Goals</Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
