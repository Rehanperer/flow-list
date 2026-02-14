import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(1, {
        message: "Password is required",
    }),
});

export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
    name: z.string().min(1, {
        message: "Name is required",
    }),
});

export const TaskSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required",
    }),
    description: z.string().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z.string().optional().or(z.date()),
    duration: z.number().optional(),
});

export const HabitSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required",
    }),
    frequency: z.enum(["DAILY", "WEEKLY"]),
});

