"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CheckSquare,
    Repeat,
    Zap,
    Settings,
    LogOut,
    Calendar,
    BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Tasks",
        icon: CheckSquare,
        href: "/tasks",
        color: "text-violet-500",
    },
    {
        label: "Habits",
        icon: Repeat,
        href: "/habits",
        color: "text-pink-700",
    },
    {
        label: "Calendar",
        icon: Calendar,
        href: "/calendar",
        color: "text-orange-500",
    },
    {
        label: "Analytics",
        icon: BarChart,
        href: "/analytics",
        color: "text-indigo-500",
    },
    {
        label: "Focus AI",
        icon: Zap,
        href: "/focus",
        color: "text-emerald-500",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        color: "text-gray-500",
    },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-background/60 backdrop-blur-xl border-r text-foreground">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
                        FL
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">FlowList AI</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route, i) => (
                        <motion.div
                            key={route.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link
                                href={route.href}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-primary/10 rounded-xl transition-all duration-200",
                                    pathname === route.href
                                        ? "text-primary bg-primary/10"
                                        : "text-zinc-500 hover:text-primary"
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <route.icon className={cn("h-5 w-5 mr-3 transition-transform group-hover:scale-110", route.color)} />
                                    {route.label}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    className="w-full justify-start text-zinc-500 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
};
