import { getTransactions, addTransaction, deleteTransaction } from "@/actions/finance-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    History,
    Search,
    Filter,
    ArrowLeft,
    Plus,
    Trash2,
    ArrowUpCircle,
    ArrowDownCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function TransactionsPage() {
    const transactions = await getTransactions();

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 pb-32">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/finance">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <History className="w-6 h-6 text-emerald-500" />
                            Transactions
                        </h1>
                        <p className="text-sm text-muted-foreground">Manage every dollar that flows in and out.</p>
                    </div>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6">
                    <Plus className="w-4 h-4 mr-2" /> Add New
                </Button>
            </header>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button variant="outline" size="sm" className="rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20">All</Button>
                <Button variant="outline" size="sm" className="rounded-full">Expenses</Button>
                <Button variant="outline" size="sm" className="rounded-full">Income</Button>
                <Button variant="outline" size="sm" className="rounded-full">Food</Button>
                <Button variant="outline" size="sm" className="rounded-full">Transport</Button>
                <Button variant="outline" size="sm" className="rounded-full">Entertainment</Button>
            </div>

            <Card className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-white/10 flex flex-row items-center gap-3">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="bg-transparent border-none outline-none text-sm w-full font-medium"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Filter className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/10">
                        {transactions.length === 0 ? (
                            <div className="text-center py-24">
                                <History className="w-12 h-12 text-muted-foreground mx-auto opacity-20 mb-4" />
                                <p className="text-muted-foreground">No transactions recorded yet.</p>
                            </div>
                        ) : (
                            transactions.map((t) => (
                                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-white/10 dark:hover:bg-black/20 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                        )}>
                                            {t.type === "INCOME" ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-bold">{t.category}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <span>{format(new Date(t.date), "EEE, MMM dd • hh:mm a")}</span>
                                                {t.paymentMethod && <span>• {t.paymentMethod}</span>}
                                            </div>
                                            {t.description && <p className="text-[10px] text-muted-foreground italic mt-0.5">&quot;{t.description}&quot;</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("text-lg font-black tracking-tight", t.type === "INCOME" ? "text-emerald-600" : "text-rose-600")}>
                                            {t.type === "INCOME" ? "+" : "-"}${t.amount.toLocaleString()}
                                        </div>
                                        <form action={async () => {
                                            "use server";
                                            await deleteTransaction(t.id);
                                        }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
