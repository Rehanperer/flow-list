"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";

export async function addTransaction(data: {
    amount: number;
    type: TransactionType;
    category: string;
    description?: string;
    date?: Date;
    paymentMethod?: string;
    accountId?: string;
    tags?: string[];
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const transaction = await db.transaction.create({
        data: {
            userId: session.user.id,
            accountId: data.accountId,
            amount: data.amount,
            type: data.type,
            category: data.category,
            description: data.description,
            tags: data.tags || [],
            date: data.date || new Date(),
            paymentMethod: data.paymentMethod,
        },
    });

    // If accountId is provided, update the balance
    if (data.accountId) {
        const adjustment = data.type === "INCOME" ? data.amount : -data.amount;
        await db.financialAccount.update({
            where: { id: data.accountId },
            data: { balance: { increment: adjustment } },
        });
    }

    revalidatePath("/finance");
    revalidatePath("/dashboard");
    return transaction;
}

export async function getTransactions() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
    });
}

export async function getBalanceStatus() {
    const session = await auth();
    if (!session?.user?.id) return { balance: 0, income: 0, expenses: 0 };

    const transactions = await db.transaction.findMany({
        where: { userId: session.user.id },
    });

    const income = transactions
        .filter((t) => t.type === "INCOME")
        .reduce((acc: number, t) => acc + t.amount, 0);

    const expenses = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((acc: number, t) => acc + t.amount, 0);

    return {
        balance: income - expenses,
        income,
        expenses,
    };
}

export async function deleteTransaction(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.transaction.delete({
        where: { id, userId: session.user.id },
    });

    revalidatePath("/finance");
    revalidatePath("/dashboard");
}

export async function getMonthlySummary(month: number, year: number) {
    const session = await auth();
    if (!session?.user?.id) return { income: 0, expenses: 0 };

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await db.transaction.findMany({
        where: {
            userId: session.user.id,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
    });

    const income = transactions
        .filter((t: any) => t.type === "INCOME")
        .reduce((acc: number, t: any) => acc + t.amount, 0);

    const expenses = transactions
        .filter((t: any) => t.type === "EXPENSE")
        .reduce((acc: number, t: any) => acc + t.amount, 0);

    return { income, expenses };
}

// --- Budgets ---
export async function setBudget(data: { category: string; limit: number; month: number; year: number }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const existing = await db.budget.findFirst({
        where: {
            userId: session.user.id,
            category: data.category,
            month: data.month,
            year: data.year,
        },
    });

    if (existing) {
        return await db.budget.update({
            where: { id: existing.id },
            data: { limit: data.limit },
        });
    }

    const budget = await db.budget.create({
        data: {
            userId: session.user.id,
            category: data.category,
            limit: data.limit,
            month: data.month,
            year: data.year,
        },
    });

    revalidatePath("/finance");
    return budget;
}

export async function getBudgets(month: number, year: number) {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.budget.findMany({
        where: { userId: session.user.id, month, year },
    });
}

// --- Subscriptions ---
export async function addSubscription(data: { name: string; amount: number; interval: any; nextBilling: Date }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const sub = await db.subscription.create({
        data: {
            userId: session.user.id,
            name: data.name,
            amount: data.amount,
            interval: data.interval,
            nextBilling: data.nextBilling,
        },
    });

    revalidatePath("/finance");
    return sub;
}

export async function getSubscriptions() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.subscription.findMany({
        where: { userId: session.user.id, status: "ACTIVE" },
        orderBy: { nextBilling: "asc" },
    });
}

// --- Financial Accounts ---
export async function addFinancialAccount(data: { name: string; type: string; balance: number; currency?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const account = await db.financialAccount.create({
        data: {
            userId: session.user.id,
            name: data.name,
            type: data.type,
            balance: data.balance,
            currency: data.currency || "USD",
        },
    });

    revalidatePath("/finance");
    return account;
}

export async function getFinancialAccounts() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.financialAccount.findMany({
        where: { userId: session.user.id },
    });
}

// --- Assets & Liabilities ---
export async function addAsset(data: { name: string; value: number; type: string; accountId?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const asset = await db.asset.create({
        data: {
            userId: session.user.id,
            name: data.name,
            value: data.value,
            type: data.type,
            accountId: data.accountId,
        },
    });

    revalidatePath("/finance");
    return asset;
}

export async function addLiability(data: { name: string; amount: number; type: string; accountId?: string; dueDate?: Date }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const liability = await db.liability.create({
        data: {
            userId: session.user.id,
            name: data.name,
            amount: data.amount,
            type: data.type,
            accountId: data.accountId,
            dueDate: data.dueDate,
        },
    });

    revalidatePath("/finance");
    return liability;
}

export async function getNetWorth() {
    const session = await auth();
    if (!session?.user?.id) return { assets: 0, liabilities: 0, netWorth: 0 };

    const assets = await db.asset.findMany({ where: { userId: session.user.id } });
    const liabilities = await db.liability.findMany({ where: { userId: session.user.id } });
    const accounts = await db.financialAccount.findMany({ where: { userId: session.user.id } });

    const totalAssets = assets.reduce((acc: number, a: any) => acc + a.value, 0) +
        accounts.filter((a: any) => a.type !== "CREDIT").reduce((acc: number, a: any) => acc + a.balance, 0);

    const totalLiabilities = liabilities.reduce((acc: number, l: any) => acc + l.amount, 0) +
        accounts.filter((a: any) => a.type === "CREDIT").reduce((acc: number, a: any) => acc + Math.abs(a.balance), 0);

    return {
        assets: totalAssets,
        liabilities: totalLiabilities,
        netWorth: totalAssets - totalLiabilities,
    };
}

// --- Savings Goals ---
export async function addSavingsGoal(data: { name: string; target: number; deadline?: Date }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const goal = await db.savingsGoal.create({
        data: {
            userId: session.user.id,
            name: data.name,
            target: data.target,
            deadline: data.deadline,
        },
    });

    revalidatePath("/finance");
    return goal;
}

export async function updateSavingsGoal(id: string, current: number) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.savingsGoal.update({
        where: { id, userId: session.user.id },
        data: { current },
    });

    revalidatePath("/finance");
}

export async function getSavingsGoals() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.savingsGoal.findMany({
        where: { userId: session.user.id },
    });
}
