import { getHabits } from "@/actions/habit-actions";
import { HabitList } from "@/components/habits/habit-list";
import { CreateHabitModal } from "@/components/habits/create-habit-modal";
import { HabitHeatmap } from "@/components/habits/habit-heatmap";

export default async function HabitsPage() {
    const habits = await getHabits();

    const allLogs = habits.flatMap(habit => habit.logs);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Habits</h1>
                    <p className="text-muted-foreground">Track your streaks and build consistency.</p>
                </div>
                <CreateHabitModal />
            </div>

            <div className="space-y-10">
                <HabitHeatmap logs={allLogs} />
                <HabitList habits={habits} />
            </div>
        </div>
    );
}
