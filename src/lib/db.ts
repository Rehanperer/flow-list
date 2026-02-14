import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const initPrisma = () => {
    // If we have a connection string, use the pool adapter (for Vercel/Neon)
    if (connectionString) {
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({ adapter });
    }

    // Fallback for local development or build time
    return new PrismaClient();
};

export const db = globalForPrisma.prisma ?? initPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
