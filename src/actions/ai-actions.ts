"use server";

import { createTask, getTasks } from "./task-actions";
import { createHabit } from "./habit-actions";
import OpenAI from "openai";
import { auth } from "@/auth";

// Initialize OpenAI client with Groq base URL (User provided Groq key)
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || "dummy-key",
    baseURL: "https://api.groq.com/openai/v1",
});

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "create_task",
            description: "Create a new task for the user",
            parameters: {
                type: "object",
                properties: {
                    title: { type: "string", description: "The title of the task" },
                    description: { type: "string", description: "A detailed description" },
                    priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
                    dueDate: { type: "string", description: "The due date in YYYY-MM-DD format" },
                },
                required: ["title"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_pending_tasks",
            description: "Get the current list of pending tasks for the user to help with scheduling",
            parameters: {
                type: "object",
                properties: {},
            },
        },
    },
    {
        type: "function",
        function: {
            name: "create_habit",
            description: "Create a new habit to track",
            parameters: {
                type: "object",
                properties: {
                    title: { type: "string", description: "The habit title" },
                    frequency: { type: "string", enum: ["DAILY", "WEEKLY"] },
                },
                required: ["title", "frequency"],
            },
        },
    },
];

export async function chatWithAI(messages: { role: "user" | "assistant"; content: string }[]) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    if (!process.env.GROQ_API_KEY) {
        return {
            error: "Configuration Error",
            message: "GROQ_API_KEY is missing in server environment."
        };
    }

    try {
        let currentMessages = [
            { role: "system", content: "You are FlowList AI, a helpful productivity assistant. You can create tasks, habits, and retrieve the user's task list to help them plan a schedule. If you use a tool, explain what you did. For scheduling, fetch the tasks first, then suggest a time-blocked plan based on priorities." },
            ...messages as any
        ];

        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: currentMessages,
            tools,
            tool_choice: "auto",
        });

        let responseMessage = response.choices[0].message;

        if (responseMessage.tool_calls) {
            // Handle tool calls
            const toolResults = [];

            for (const toolCall of responseMessage.tool_calls) {
                const functionName = (toolCall as any).function.name;
                const args = JSON.parse((toolCall as any).function.arguments);

                let result;
                if (functionName === "create_task") {
                    result = await createTask(args);
                } else if (functionName === "create_habit") {
                    result = await createHabit(args);
                } else if (functionName === "get_pending_tasks") {
                    const tasks = await getTasks();
                    result = { tasks: tasks.filter(t => t.status === "TODO") };
                }

                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: JSON.stringify(result),
                });
            }

            // Send tool results back to the model for a final response
            const finalResponse = await openai.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    ...currentMessages,
                    responseMessage,
                    ...toolResults as any
                ],
            });

            return {
                message: finalResponse.choices[0].message.content || "I've processed your request."
            };
        }

        return {
            message: responseMessage.content || "I'm not sure how to help with that."
        };
    } catch (error: any) {
        console.error("AI Error:", error);
        return {
            error: "AI Service Error",
            message: error.message || "Failed to get response from AI."
        };
    }
}
