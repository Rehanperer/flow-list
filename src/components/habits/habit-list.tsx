"use client";

import { Habit, HabitLog } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { Check, Flame, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { completeHabitToday, deleteHabit } from "@/actions/habit-actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface HabitWithLogs extends Habit {
    logs: HabitLog[];
}

export const HabitList = ({ habits }: { habits: HabitWithLogs[] }) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const onComplete = (id: string) => {
        startTransition(() => {
            completeHabitToday(id).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) toast.success("Habit updated!");
            });
        });
    };

    const onDelete = (id: string) => {
        startTransition(() => {
            deleteHabit(id).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) toast.success("Habit deleted");
            });
        });
    };

    const isCompletedToday = (logs: HabitLog[]) => {
        const today = new Date();
        return logs.some(log => isSameDay(new Date(log.completedAt), today));
    };

    if (habits.length === 0) {
        return (
            <div className="text-center text-muted-foreground mt-10">
                <p>No habits tracked yet. Start building one!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((habit) => {
                const completed = isCompletedToday(habit.logs);

                return (
                    <Card key={habit.id} className="hover:shadow-md transition relative group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{habit.title}</h3>
                                    <p className="text-xs text-muted-foreground">{habit.frequency}</p>
                                </div>
                                <div
                                    role="button"
                                    onClick={() => onDelete(habit.id)}
                                    className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-orange-500">
                                    <Flame className="w-5 h-5 mr-1 fill-orange-500" />
                                    <span className="font-bold">{habit.streakCurrent}</span>
                                </div>

                                <Button
                                    size="sm"
                                    variant={completed ? "secondary" : "default"}
                                    onClick={() => !completed && onComplete(habit.id)}
                                    disabled={completed || isPending}
                                    className={cn(completed && "bg-emerald-100 text-emerald-700 hover:bg-emerald-200")}
                                >
                                    {completed ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Done
                                        </>
                                    ) : "Mark Done"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
