import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

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
            const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
            const isPublicRoute = ["/", "/login", "/register"].includes(nextUrl.pathname);

            if (isApiAuthRoute) return true;

            if (isPublicRoute) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            return isLoggedIn;
        },
        async session({ session, token }: any) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token }: any) {
            return token;
        }
    }
} satisfies NextAuthConfig;
