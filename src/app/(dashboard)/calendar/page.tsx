import { getTasks } from "@/actions/task-actions";
import { getHabits } from "@/actions/habit-actions";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
    const [tasks, habits] = await Promise.all([
        getTasks(),
        getHabits()
    ]);

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Workspace Calendar</h1>
                <p className="text-muted-foreground">Manage your deadlines and habits in a unified view.</p>
            </div>
            <div className="flex-1">
                <CalendarView tasks={tasks} habits={habits as any} />
            </div>
        </div>
    );
}
