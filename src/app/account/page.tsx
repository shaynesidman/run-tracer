"use client";

import { useAuth } from "@clerk/nextjs";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AccountInfo from "@/components/AccountInfo";
import AllRuns from "@/components/AllRuns";

export default function Account() {
    const { isLoaded, userId } = useAuth();

    if (!isLoaded) {
        <LoadingSpinner />;
    }

    if (isLoaded && !userId) {
        return (
            <section className="h-full w-full bg-[var(--bg-secondary)] max-w-5xl rounded-lg p-4 mx-auto flex flex-col justify-center items-center">
                <p className="text-xl">Sign in to view account info</p>
            </section>
        );
    }

    return (
        <section className="h-full w-full max-w-5xl px-4 mx-auto flex flex-col justify-center items-center gap-8">
            <AccountInfo />
            <AllRuns />
        </section>
    );
}