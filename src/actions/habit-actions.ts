"use server";

import { db } from "@/lib/db";
import { HabitSchema } from "@/lib/schemas";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createHabit = async (values: z.infer<typeof HabitSchema>) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const validatedFields = HabitSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields!" };

    const { title, frequency } = validatedFields.data;

    try {
        await db.habit.create({
            data: {
                userId: session.user.id,
                title,
                frequency,
            },
        });
        revalidatePath("/habits");
        return { success: "Habit created!" };
    } catch (error) {
        return { error: "Failed to create habit" };
    }
};

export const getHabits = async () => {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        return await db.habit.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: { logs: true }, // Include logs to check completion today
        });
    } catch (error) {
        return [];
    }
};

export const deleteHabit = async (id: string) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await db.habit.delete({
            where: { id, userId: session.user.id },
        });
        revalidatePath("/habits");
        return { success: "Habit deleted!" };
    } catch (error) {
        return { error: "Failed to delete habit" };
    }
};

export const completeHabitToday = async (habitId: string) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        // Check if already completed today (naive check: log created > today start)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingLog = await db.habitLog.findFirst({
            where: {
                habitId,
                completedAt: {
                    gte: today
                }
            }
        });

        if (existingLog) {
            return { error: "Already completed today" };
        }

        // Create log
        await db.habitLog.create({
            data: { habitId }
        });

        // Update streak
        const habit = await db.habit.findUnique({ where: { id: habitId } });
        if (habit) {
            await db.habit.update({
                where: { id: habitId },
                data: {
                    streakCurrent: { increment: 1 },
                    streakBest: { set: Math.max(habit.streakBest, habit.streakCurrent + 1) }
                }
            });
        }

        revalidatePath("/habits");
        return { success: "Habit completed!" };
    } catch (error) {
        return { error: "Failed to log habit" };
    }
};
