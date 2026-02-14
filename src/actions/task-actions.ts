"use server";

import { db } from "@/lib/db";
import { TaskSchema } from "@/lib/schemas";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createTask = async (values: z.infer<typeof TaskSchema>) => {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const validatedFields = TaskSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { title, description, status, priority, dueDate, duration } = validatedFields.data;

    try {
        await db.task.create({
            data: {
                userId: session.user.id,
                title,
                description,
                status: status ?? "TODO",
                priority: priority ?? "MEDIUM",
                dueDate: dueDate ? new Date(dueDate) : undefined,
                duration,
            },
        });

        revalidatePath("/tasks");
        return { success: "Task created!" };
    } catch (error) {
        return { error: "Failed to create task" };
    }
};

export const getTasks = async () => {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    try {
        const tasks = await db.task.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });
        return tasks;
    } catch (error) {
        return [];
    }
};

export const updateTask = async (id: string, values: z.infer<typeof TaskSchema>) => {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const validatedFields = TaskSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    try {
        await db.task.update({
            where: { id, userId: session.user.id },
            data: { ...validatedFields.data },
        });

        revalidatePath("/tasks");
        return { success: "Task updated!" };
    } catch (error) {
        return { error: "Failed to update task" };
    }
};

export const deleteTask = async (id: string) => {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        await db.task.delete({
            where: { id, userId: session.user.id },
        });

        revalidatePath("/tasks");
        return { success: "Task deleted!" };
    } catch (error) {
        return { error: "Failed to delete task" };
    }
};
