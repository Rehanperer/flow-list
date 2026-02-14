import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/lib/schemas";

export default {
    providers: [
        Credentials({
            async authorize(credentials) {
                // Validation logic is in auth.ts
                return null;
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isPublicRoute = ["/", "/login", "/register"].includes(nextUrl.pathname);

            if (isPublicRoute && isLoggedIn) {
                return false; // Force redirect if already logged in on a public page
            }

            return true; // Let middleware handle complex redirects
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token }) {
            return token;
        }
    }
} satisfies NextAuthConfig;
