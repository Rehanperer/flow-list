"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithAI } from "@/actions/ai-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export const ChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Prepare context for API
        const apiMessages = [...messages, userMessage].slice(-10); // Limit context window

        const response = await chatWithAI(apiMessages);

        if (response.error) {
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: `⚠️ Error: ${response.message}`
            }]);
        } else if (response.message) {
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: response.message
            }]);
        }

        setIsLoading(false);
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-emerald-500" />
                    FlowList Assistant (Grok)
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-20">
                                <p>Ask me anything about your tasks, habits, or productivity!</p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex items-start gap-2 max-w-[80%]",
                                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <Avatar className="w-8 h-8">
                                    {m.role === "user" ? (
                                        <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                    ) : (
                                        <AvatarFallback className="bg-emerald-100 text-emerald-600">
                                            <Bot className="w-4 h-4" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div
                                    className={cn(
                                        "p-3 rounded-lg text-sm",
                                        m.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    )}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 mr-auto">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-600">
                                        <Bot className="w-4 h-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-muted p-3 rounded-lg">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Input
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};
