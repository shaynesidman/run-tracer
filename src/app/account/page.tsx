"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";

export default function Account() {
    const { isLoaded, userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && userId) {
            router.push("/account/info");
        }
    }, [isLoaded, userId, router]);

    if (!isLoaded) {
        return (
            <section className="h-full w-full bg-[var(--bg-secondary)] max-w-5xl rounded-lg p-4 mx-auto flex flex-col justify-center items-center">
                <LoadingSpinner />
            </section>
        );
    }

    if (isLoaded && !userId) {
        return (
            <section className="h-full w-full bg-[var(--bg-secondary)] max-w-5xl rounded-lg p-4 mx-auto flex flex-col justify-center items-center">
                <p className="text-xl">Sign in to view account info</p>
            </section>
        );
    }

    return null;
}