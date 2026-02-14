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
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const transaction = await db.transaction.create({
        data: {
            userId: session.user.id,
            amount: data.amount,
            type: data.type,
            category: data.category,
            description: data.description,
            date: data.date || new Date(),
            paymentMethod: data.paymentMethod,
        },
    });

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
        .reduce((acc, t) => acc + t.amount, 0);

    const expenses = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((acc, t) => acc + t.amount, 0);

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
        .filter((t) => t.type === "INCOME")
        .reduce((acc, t) => acc + t.amount, 0);

    const expenses = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((acc, t) => acc + t.amount, 0);

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
