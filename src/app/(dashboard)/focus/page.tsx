import { ChatInterface } from "@/components/ai/chat-interface";
import { PomodoroTimer } from "@/components/focus/pomodoro-timer";
import { Zap, Sparkles } from "lucide-react";

export default function FocusPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header>
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-orange-500/10 rounded-lg">
                        <Zap className="w-5 h-5 text-orange-500" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                        Deep Focus
                    </h1>
                </div>
                <p className="text-muted-foreground flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Combine the Pomodoro technique with AI assistance for hyper-productivity.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 order-2 lg:order-1">
                    <ChatInterface />
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                    <PomodoroTimer />
                    <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground">
                        <h4 className="font-semibold mb-2">How it works:</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>**Work**: 25m focusing on one task.</li>
                            <li>**Break**: 5m rest to recharge.</li>
                            <li>Ask AI to help you plan your next session!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
