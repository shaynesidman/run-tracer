"use client";

import AllRuns from "@/components/AllRuns";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function AccountAllRuns() {
    const { userId } = useAuth();

    if (!userId) {
        return (
            <div className="w-full border border-[var(--bg-secondary)] text-center p-4 rounded-lg">
                Sign in to see account info and recent activity.
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <AllRuns />
            <Link href="/map" className="w-full border border-[var(--bg-secondary)] text-center p-2 rounded-lg">
                Go to map to add more runs
            </Link>
        </div>
    );
}