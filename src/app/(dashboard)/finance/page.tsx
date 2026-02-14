import { getBalanceStatus, getTransactions, getNetWorth, getFinancialAccounts } from "@/actions/finance-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Wallet,
    ArrowDownCircle,
    ArrowUpCircle,
    Sparkles,
    Plus,
    TrendingUp,
    PieChart,
    CreditCard,
    Target,
    RefreshCw,
    History,
    ChevronRight,
    Gem
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function FinancePage() {
    const { balance, income, expenses } = await getBalanceStatus();
    const { netWorth, assets, liabilities } = await getNetWorth();
    const transactions = await getTransactions();
    const accounts = await getFinancialAccounts();

    // Safe-to-spend calculation
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - today.getDate() + 1;
    const safeToSpend = balance > 0 ? (balance / remainingDays) : 0;

    const navItems = [
        { name: "Transactions", icon: History, href: "/finance/transactions", color: "text-blue-500", bg: "bg-blue-500/10" },
        { name: "Budgets", icon: PieChart, href: "/finance/budgets", color: "text-purple-500", bg: "bg-purple-500/10" },
        { name: "Subscriptions", icon: RefreshCw, href: "/finance/subscriptions", color: "text-rose-500", bg: "bg-rose-500/10" },
        { name: "Savings Goals", icon: Target, href: "/finance/goals", color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { name: "Accounts", icon: CreditCard, href: "/finance/accounts", color: "text-orange-500", bg: "bg-orange-500/10" },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                        FlowFinance AI
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2 text-lg">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        Smart wealth management powered by AI.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 px-6">
                        <Plus className="w-4 h-4 mr-2" /> Quick Add
                    </Button>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-emerald-100/80 text-xs font-medium uppercase tracking-wider flex items-center justify-between">
                            Total Balance <TrendingUp className="w-4 h-4 opacity-50" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${balance.toLocaleString()}</div>
                        <div className="mt-2 text-emerald-100/90 text-[10px] uppercase font-bold tracking-widest">Safe to spend: ${safeToSpend.toFixed(2)}/day</div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-400 text-xs font-medium uppercase tracking-wider flex items-center justify-between">
                            Net Worth <Gem className="w-4 h-4 opacity-50" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${netWorth.toLocaleString()}</div>
                        <div className="mt-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">A: ${assets.toLocaleString()} | L: ${liabilities.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-lg">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">${income.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-lg">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-500">${expenses.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {navItems.map((item) => (
                    <Link key={item.name} href={item.href}>
                        <Card className="hover:scale-105 transition-all cursor-pointer border-white/20 bg-white/30 dark:bg-black/30 backdrop-blur-md">
                            <CardContent className="p-4 flex flex-col items-center gap-2">
                                <div className={cn("p-2 rounded-full", item.bg, item.color)}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-center">{item.name}</span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Transactions */}
                <Card className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Recent Transactions</CardTitle>
                        <Link href="/finance/transactions">
                            <Button variant="ghost" size="sm" className="text-emerald-600 text-xs">View All <ChevronRight className="w-3 h-3 ml-1" /></Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/10">
                            {transactions.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground text-sm">No transactions found.</div>
                            ) : (
                                transactions.slice(0, 5).map((t: any) => (
                                    <div key={t.id} className="flex items-center justify-between p-4 hover:bg-white/10 dark:hover:bg-black/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl text-xs font-bold",
                                                t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                            )}>
                                                {t.type === "INCOME" ? "IN" : "OUT"}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">{t.category}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{format(new Date(t.date), "MMM dd")} • {t.description || "No notes"}</div>
                                            </div>
                                        </div>
                                        <div className={cn("font-bold text-sm", t.type === "INCOME" ? "text-emerald-600" : "text-rose-600")}>
                                            {t.type === "INCOME" ? "+" : "-"}${t.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Accounts Summary */}
                <Card className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Accounts & Assets</CardTitle>
                        <Link href="/finance/accounts">
                            <Button variant="ghost" size="sm" className="text-slate-600 text-xs text-secondary-accent">Manage <ChevronRight className="w-3 h-3 ml-1" /></Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {accounts.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground text-sm">No accounts setup.</div>
                        ) : (
                            accounts.map((acc: any) => (
                                <div key={acc.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/20 dark:bg-black/20 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-500/10 rounded-xl">
                                            <CreditCard className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">{acc.name}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">{acc.type}</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-sm">${acc.balance.toLocaleString()}</div>
                                </div>
                            ))
                        )}
                        <Button variant="outline" className="w-full rounded-xl border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-xs" asChild>
                            <Link href="/finance/accounts"><Plus className="w-3 h-3 mr-2" /> Add Account or Asset</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
