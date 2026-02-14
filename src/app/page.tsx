import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <div className="space-y-6 text-center">
        <h1 className="text-6xl font-semibold text-white drop-shadow-md">
          FlowList AI
        </h1>
        <p className="text-white text-lg">
          Master your day with AI-powered task management.
        </p>
        <div>
          <Button variant="secondary" size="lg" asChild className="mr-4">
            <Link href="/login">
              Sign In
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="bg-transparent text-white border-white hover:bg-white/20">
            <Link href="/register">
              Register
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
