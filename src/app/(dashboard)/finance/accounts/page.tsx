import { getFinancialAccounts, getNetWorth, addFinancialAccount } from "@/actions/finance-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    ArrowLeft,
    Plus,
    Gem,
    TrendingDown,
    Banknote,
    Briefcase,
    Building2,
    PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function AccountsPage() {
    const accounts = await getFinancialAccounts();
    const { assets, liabilities, netWorth } = await getNetWorth();

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
                            <Gem className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                            Accounts & Net Worth
                        </h1>
                        <p className="text-sm text-muted-foreground">Balance sheet of your life.</p>
                    </div>
                </div>
                <Button className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl h-10 px-6">
                    <Plus className="w-4 h-4 mr-2" /> Add Account
                </Button>
            </header>

            {/* Net Worth Hero */}
            <Card className="relative overflow-hidden border-none bg-slate-950 text-white shadow-2xl p-8 rounded-[2rem]">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            Current Net Worth <PieChart className="w-3 h-3" />
                        </p>
                        <h2 className="text-5xl font-black tabular-nums">${netWorth.toLocaleString()}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-8 border-l border-slate-800 pl-8">
                        <div>
                            <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Assets</p>
                            <p className="text-2xl font-bold tabular-nums">${assets.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Liabilities</p>
                            <p className="text-2xl font-bold tabular-nums">${liabilities.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                {/* Decorative background glass */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Liquidity (Accounts) */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                        <Banknote className="w-5 h-5 text-emerald-500" />
                        Liquidity & Accounts
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {accounts.length === 0 ? (
                            <div className="text-center py-12 bg-white/30 dark:bg-black/30 rounded-3xl border border-white/10 text-muted-foreground text-sm">
                                Setup your first bank account or cash fund.
                            </div>
                        ) : (
                            accounts.map((acc: any) => (
                                <div key={acc.id} className="p-5 rounded-3xl bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                                            acc.type === "BANK" ? "bg-blue-500/10 text-blue-600" :
                                                acc.type === "CREDIT" ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                                        )}>
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold">{acc.name}</div>
                                            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{acc.type} • {acc.currency}</div>
                                        </div>
                                    </div>
                                    <div className="text-xl font-black tracking-tight">${acc.balance.toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Assets & Liabilities List (Small summary) */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                        <TrendingDown className="w-5 h-5 text-purple-500" />
                        Assets & Investments
                    </h3>
                    <div className="p-6 rounded-3xl bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 shadow-sm space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Gem className="w-4 h-4 text-emerald-500" />
                                <span>Real Estate & Physical Assets</span>
                            </div>
                            <span className="font-bold">$0</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-purple-500" />
                                <span>Stocks & Crypto</span>
                            </div>
                            <span className="font-bold">$0</span>
                        </div>
                        <div className="flex items-center justify-between text-sm pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2 font-bold text-rose-500">
                                <TrendingDown className="w-4 h-4" />
                                <span>Total Debt & Liabilities</span>
                            </div>
                            <span className="font-bold text-rose-500">$0</span>
                        </div>
                        <Button variant="outline" className="w-full rounded-2xl border-white/20 text-xs py-5">
                            <Plus className="w-4 h-4 mr-2" /> Add Other Asset / Debt
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
