"use client";

import { useRouter } from "next/navigation";
import RecentRuns from "@/components/RecentRuns";

export default function Home() {
    const router = useRouter();

    return (
        <section className="bg-fixed bg-gradient-to-br from-green-900 via-green-700 to-gray-600 h-full flex flex-col justify-center items-center gap-6 text-white">
            <p className="text-3xl">Plan and track your runs, walks, bikes, and more with ease.</p>
            <button 
                className="text-green-900 bg-white text-xl px-6 py-4 rounded-lg hover:cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => router.push("/map")}
            >
                Go to map
            </button>
            <RecentRuns />
        </section>
    );
}
