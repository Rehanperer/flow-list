"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { chatWithAI } from "@/actions/ai-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Send, Loader2, Mic, MicOff, Volume2, VolumeX, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export const ChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isAutoSpeak, setIsAutoSpeak] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const speak = useCallback((text: string) => {
        if (typeof window === "undefined") return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        const voices = window.speechSynthesis.getVoices();
        const premiumVoice = voices.find(v => v.name.includes("Samantha") || v.name.includes("Enhanced") || v.name.includes("Premium"));
        if (premiumVoice) utterance.voice = premiumVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    const handleForcedSubmit = useCallback(async (val: string) => {
        if (!val.trim() || isLoading) return;
        const userMessage: Message = { role: "user", content: val };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        const apiMessages = [...messages, userMessage].slice(-10);
        const response = await chatWithAI(apiMessages);

        if (response.error) {
            setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Error: ${response.message}` }]);
        } else if (response.message) {
            setMessages((prev) => [...prev, { role: "assistant", content: response.message }]);
            if (isAutoSpeak) speak(response.message);
        }
        setIsLoading(true); // Keep loading state until voice starts or ends? No, let's just finish.
        setIsLoading(false);
    }, [isLoading, isAutoSpeak, messages, speak]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                handleForcedSubmit(transcript);
            };

            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, [handleForcedSubmit]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setIsListening(true);
            recognitionRef.current?.start();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleForcedSubmit(input);
    };

    return (
        <Card className="h-[600px] flex flex-col backdrop-blur-xl bg-white/40 dark:bg-black/40 border-white/20 shadow-2xl relative overflow-hidden">
            <CardHeader className="border-b border-white/10 backdrop-blur-md z-10">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="w-6 h-6 text-emerald-500 animate-pulse" />
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">FlowLife Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsAutoSpeak(!isAutoSpeak)}
                            className={cn("rounded-full", isAutoSpeak ? "text-emerald-500" : "text-muted-foreground")}
                        >
                            {isAutoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 relative">
                <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-20 space-y-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto"
                                >
                                    <Mic className="w-8 h-8 text-emerald-500" />
                                </motion.div>
                                <p className="text-sm font-medium">Talk to me! Try saying &quot;How&apos;s my wealth doing?&quot;</p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn(
                                    "flex items-start gap-2 max-w-[85%]",
                                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <Avatar className="w-8 h-8 border border-white/20 shadow-sm">
                                    {m.role === "user" ? (
                                        <AvatarFallback className="bg-slate-200 dark:bg-slate-800"><User className="w-4 h-4" /></AvatarFallback>
                                    ) : (
                                        <AvatarFallback className="bg-emerald-500 text-white">
                                            <Bot className="w-4 h-4" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="space-y-1">
                                    <div
                                        className={cn(
                                            "p-3 rounded-2xl text-sm shadow-sm relative group",
                                            m.role === "user"
                                                ? "bg-emerald-600 text-white rounded-tr-none"
                                                : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-tl-none text-slate-800 dark:text-slate-100"
                                        )}
                                    >
                                        {m.content}
                                        {m.role === "assistant" && (
                                            <button
                                                onClick={() => speak(m.content)}
                                                className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-emerald-500/10 rounded-full text-emerald-600"
                                            >
                                                <Play className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 mr-auto">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-emerald-500 text-white">
                                        <Bot className="w-4 h-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-white/20">
                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <AnimatePresence>
                    {isSpeaking && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-xl z-20"
                        >
                            <div className="flex gap-1">
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [4, 12, 4] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                        className="w-1 bg-white rounded-full"
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">AI Speaking</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>

            <CardFooter className="p-4 pt-0 backdrop-blur-md z-10">
                <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center">
                    <div className="relative flex-1">
                        <Input
                            placeholder={isListening ? "Listening..." : "Ask FlowLife anything..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="rounded-2xl border-white/20 bg-white/50 dark:bg-black/50 pr-12 h-12"
                        />
                        <Button
                            type="button"
                            onClick={toggleListening}
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "absolute right-1 top-1/2 -translate-y-1/2 rounded-xl h-10 w-10 transition-all",
                                isListening ? "bg-rose-500 text-white animate-pulse" : "text-emerald-500 hover:bg-emerald-500/10"
                            )}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </Button>
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 h-12 w-12 p-0 shadow-lg shadow-emerald-500/20"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};
