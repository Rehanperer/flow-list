import { getTasks } from "@/actions/task-actions";
import { getHabits } from "@/actions/habit-actions";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export default async function AnalyticsPage() {
    const [tasks, habits] = await Promise.all([
        getTasks(),
        getHabits()
    ]);

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Insights & Mastery</h1>
                <p className="text-muted-foreground">Detailed breakdown of your productivity patterns.</p>
            </div>
            <div className="flex-1">
                <AnalyticsView tasks={tasks} habits={habits as any} />
            </div>
        </div>
    );
}
