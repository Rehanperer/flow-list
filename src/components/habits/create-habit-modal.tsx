"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { HabitSchema } from "@/lib/schemas";
import { createHabit } from "@/actions/habit-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import { FormSuccess } from "@/components/ui/form-success";
import { Plus } from "lucide-react";

export const CreateHabitModal = () => {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof HabitSchema>>({
        resolver: zodResolver(HabitSchema),
        defaultValues: {
            title: "",
            frequency: "DAILY",
        },
    });

    const onSubmit = (values: z.infer<typeof HabitSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            createHabit(values).then((data) => {
                if (data?.error) {
                    setError(data.error);
                }
                if (data?.success) {
                    setSuccess(data.success);
                    form.reset();
                    setTimeout(() => {
                        setOpen(false);
                        setSuccess("");
                    }, 500);
                }
            }).catch(() => setError("Something went wrong"));
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Habit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Habit</DialogTitle>
                    <DialogDescription>
                        Start tracking a new habit. Consistency is key!
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Habit Title</Label>
                        <Input
                            {...form.register("title")}
                            id="title"
                            placeholder="Drink Water, Read 10 pages..."
                            disabled={isPending}
                        />
                        {form.formState.errors.title && (
                            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select
                            disabled={isPending}
                            onValueChange={(value) => form.setValue("frequency", value as "DAILY" | "WEEKLY")}
                            defaultValue={form.getValues("frequency")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DAILY">Daily</SelectItem>
                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <FormError message={error} />
                    <FormSuccess message={success} />

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Creating..." : "Create Habit"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
