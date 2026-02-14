"use client";

import { motion, AnimatePresence } from "framer-motion";

export const DashboardAnimations = ({ children }: { children: React.ReactNode }) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
