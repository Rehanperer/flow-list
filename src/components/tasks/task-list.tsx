"use client";

import { Task } from "@prisma/client";
import { format } from "date-fns";
import { CheckCircle, Circle, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateTask, deleteTask } from "@/actions/task-actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface TaskListProps {
    tasks: Task[];
}

import { toast } from "sonner";

export const TaskList = ({ tasks }: { tasks: any[] }) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const onToggleStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "COMPLETED" ? "TODO" : "COMPLETED";
        startTransition(() => {
            updateTask(id, { status: newStatus as any } as any).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) toast.success(`Task marked as ${newStatus.toLowerCase()}`);
            });
        });
    };

    const onDelete = (id: string) => {
        startTransition(() => {
            deleteTask(id).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) toast.success("Task deleted");
            });
        });
    };

    if (tasks.length === 0) {
        return (
            <div className="text-center text-muted-foreground mt-10">
                <p>No tasks found. Create one to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tasks.map((task) => (
                <Card
                    key={task.id}
                    className={cn(
                        "cursor-pointer hover:shadow-md transition",
                        isPending && "opacity-50"
                    )}
                    onClick={() => onToggleStatus(task.id, task.status)}
                >
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-x-4">
                            <div className={cn(
                                "p-2 rounded-full",
                                task.status === "COMPLETED" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"
                            )}>
                                {task.status === "COMPLETED" ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className={cn(
                                    "font-medium",
                                    task.status === "COMPLETED" && "line-through text-muted-foreground"
                                )}>
                                    {task.title}
                                </h3>
                                {task.dueDate && (
                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {format(new Date(task.dueDate), "PPP")}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <Badge variant={
                                task.priority === "URGENT" ? "destructive" :
                                    task.priority === "HIGH" ? "default" :
                                        task.priority === "MEDIUM" ? "secondary" : "outline"
                            }>
                                {task.priority}
                            </Badge>
                            <div
                                role="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(task.id);
                                }}
                                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
