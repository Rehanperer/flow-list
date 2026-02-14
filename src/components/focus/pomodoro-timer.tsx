"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Coffee, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export const PomodoroTimer = () => {
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleSessionEnd = useCallback(() => {
        setIsActive(false);
        // Beep sound (using a public URL for a gentle notification)
        if (typeof window !== "undefined") {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.play().catch(() => { });
        }

        if (!isBreak) {
            setIsBreak(true);
            setTimeLeft(BREAK_TIME);
        } else {
            setIsBreak(false);
            setTimeLeft(WORK_TIME);
        }
    }, [isBreak]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleSessionEnd();
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, handleSessionEnd]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setIsBreak(false);
        setTimeLeft(WORK_TIME);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = ((isBreak ? BREAK_TIME - timeLeft : WORK_TIME - timeLeft) / (isBreak ? BREAK_TIME : WORK_TIME)) * 100;

    return (
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center pb-2">
                <CardTitle className="flex items-center justify-center gap-2 text-xl font-bold">
                    {isBreak ? (
                        <>
                            <Coffee className="w-5 h-5 text-sky-500" />
                            Break Time
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5 text-orange-500" />
                            Focusing
                        </>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                {/* Timer Circle */}
                <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-muted/20"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={552.92}
                            strokeDashoffset={552.92 * (1 - progress / 100)}
                            className={cn(
                                "transition-all duration-1000",
                                isBreak ? "text-sky-500" : "text-orange-500"
                            )}
                        />
                    </svg>
                    <div className="absolute text-5xl font-mono font-bold tracking-tighter">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button
                        size="lg"
                        variant={isActive ? "outline" : "default"}
                        className={cn(
                            "w-32 transition-all",
                            !isActive && (isBreak ? "bg-sky-500 hover:bg-sky-600" : "bg-orange-500 hover:bg-orange-600")
                        )}
                        onClick={toggleTimer}
                    >
                        {isActive ? (
                            <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Start
                            </>
                        )}
                    </Button>
                    <Button size="lg" variant="ghost" onClick={resetTimer}>
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
