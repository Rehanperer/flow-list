import { getTasks } from "@/actions/task-actions";
import { TaskList } from "@/components/tasks/task-list";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";

export default async function TasksPage() {
    const tasks = await getTasks();

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Tasks</h1>
                    <p className="text-muted-foreground">Manage your daily tasks and to-dos.</p>
                </div>
                <CreateTaskModal />
            </div>
            <TaskList tasks={tasks} />
        </div>
    );
}
