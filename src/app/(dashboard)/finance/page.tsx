import { getBalanceStatus, getTransactions, getBudgets } from "@/actions/finance-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Sparkles, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default async function FinancePage() {
    const { balance, income, expenses } = await getBalanceStatus();
    const transactions = await getTransactions();

    // Safe-to-spend calculation (Simple version: (Current Month Income - Monthly Expenses) / Remaining Days)
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - today.getDate() + 1;
    const safeToSpend = balance > 0 ? (balance / remainingDays) : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                        FlowFinance AI
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2 text-lg">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        Smart wealth management powered by Grok.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                        <Plus className="w-4 h-4 mr-2" /> Add Transaction
                    </Button>
                </div>
            </header>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-emerald-100/80 text-sm font-medium uppercase tracking-wider">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">${balance.toLocaleString()}</div>
                        <div className="mt-4 flex items-center gap-2 text-emerald-100/90 text-sm">
                            <Wallet className="w-4 h-4" />
                            <span>Safe to spend: <strong>${safeToSpend.toFixed(2)} / day</strong></span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Monthly Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
                            <ArrowUpCircle className="w-6 h-6" /> ${income.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Monthly Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-rose-500 flex items-center gap-2">
                            <ArrowDownCircle className="w-6 h-6" /> ${expenses.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Transactions */}
                <Card className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-xl min-h-[400px]">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No transactions yet. Start by adding one!
                                </div>
                            ) : (
                                transactions.slice(0, 10).map((t: any) => (
                                    <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/30 dark:bg-black/30 border border-white/10 hover:bg-white/50 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl",
                                                t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                            )}>
                                                {t.type === "INCOME" ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{t.category}</div>
                                                <div className="text-xs text-muted-foreground">{format(new Date(t.date), "MMM dd, yyyy")} • {t.description || "No notes"}</div>
                                            </div>
                                        </div>
                                        <div className={cn("font-bold", t.type === "INCOME" ? "text-emerald-600" : "text-rose-600")}>
                                            {t.type === "INCOME" ? "+" : "-"}${t.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Categories & Budgets (Placeholder for now) */}
                <Card className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-xl">
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                            <p>Analytics coming soon...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
