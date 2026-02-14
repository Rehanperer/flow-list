"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, CheckSquare, Repeat, Zap, Calendar, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    { icon: LayoutDashboard, href: "/dashboard", label: "Home" },
    { icon: CheckSquare, href: "/tasks", label: "Tasks" },
    { icon: Calendar, href: "/calendar", label: "Plan" },
    { icon: BarChart, href: "/analytics", label: "Insights" },
    { icon: Repeat, href: "/habits", label: "Habits" },
    { icon: Zap, href: "/focus", label: "AI" },
];

export const MobileNav = () => {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 bg-background/80 backdrop-blur-lg border-t">
            <div className="flex items-center justify-around max-w-lg mx-auto">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className="relative p-2">
                            <div className={cn(
                                "flex flex-col items-center gap-1 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                                <item.icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </div>
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -top-2 left-0 right-0 h-1 bg-primary rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
