"use server";

import { createTask, getTasks } from "./task-actions";
import { createHabit } from "./habit-actions";
import {
    addTransaction,
    getBalanceStatus,
    getNetWorth,
    getFinancialAccounts,
    addFinancialAccount,
    getSavingsGoals,
    addSavingsGoal
} from "./finance-actions";
import OpenAI from "openai";
import { auth } from "@/auth";

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
            description: "Get the current list of pending tasks",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "add_transaction",
            description: "Record a new financial transaction (income or expense)",
            parameters: {
                type: "object",
                properties: {
                    amount: { type: "number", description: "The transaction amount" },
                    type: { type: "string", enum: ["INCOME", "EXPENSE"] },
                    category: { type: "string", description: "e.g. Food, Salary, Rent" },
                    description: { type: "string", description: "Brief details" },
                    paymentMethod: { type: "string", description: "Cash, Card, etc." },
                    accountId: { type: "string", description: "Optional ID of the account used" },
                },
                required: ["amount", "type", "category"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_financial_status",
            description: "Get current income, expenses, and balance summary",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "get_net_worth",
            description: "Get the user's total net worth, including assets and liabilities",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "get_financial_accounts",
            description: "List all bank accounts, cash, and investment sources",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "add_savings_goal",
            description: "Set a new savings or financial goal",
            parameters: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Name of the goal" },
                    target: { type: "number", description: "Target amount to save" },
                    deadline: { type: "string", description: "Deadline date YYYY-MM-DD" },
                },
                required: ["name", "target"],
            },
        },
    },
];

export async function chatWithAI(messages: { role: "user" | "assistant"; content: string }[]) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    if (!process.env.GROQ_API_KEY) return { error: "Configuration Error", message: "GROQ_API_KEY is missing." };

    try {
        let currentMessages = [
            {
                role: "system",
                content: `You are FlowList AI, a premium productivity and expert financial advisor. 
                You have full access to the user's wealth ecosystem, including transactions, net worth, bank accounts, and savings goals.
                
                Guidelines:
                1. If a user asks about their financial health, use 'get_net_worth' and 'get_financial_status'.
                2. Be proactive: if they record an expense and their balance is low, offer a subtle warning.
                3. Be professional: Use clear, structured financial insights.
                4. Always confirm details (amount, category) when recording data.`
            },
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
            const toolResults = [];

            for (const toolCall of responseMessage.tool_calls) {
                const functionName = (toolCall as any).function.name;
                const args = JSON.parse((toolCall as any).function.arguments);

                let result;
                if (functionName === "create_task") result = await createTask(args);
                else if (functionName === "get_pending_tasks") result = { tasks: (await getTasks()).filter(t => t.status === "TODO") };
                else if (functionName === "add_transaction") result = await addTransaction(args);
                else if (functionName === "get_financial_status") result = await getBalanceStatus();
                else if (functionName === "get_net_worth") result = await getNetWorth();
                else if (functionName === "get_financial_accounts") result = await getFinancialAccounts();
                else if (functionName === "add_savings_goal") result = await addSavingsGoal(args);

                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: JSON.stringify(result),
                });
            }

            const finalResponse = await openai.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    ...currentMessages,
                    responseMessage,
                    ...toolResults as any
                ],
            });

            return { message: finalResponse.choices[0].message.content || "I've updated your wealth profile." };
        }

        return { message: responseMessage.content };
    } catch (error: any) {
        console.error("AI Error:", error);
        return { error: "AI Service Error", message: error.message };
    }
}
