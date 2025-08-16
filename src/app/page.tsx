"use client";

import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    return (
        <section className="h-full flex flex-col justify-center items-center gap-6">
            <p className="text-3xl">Plan and track your runs, walks, bikes, and more with ease.</p>
            <button 
                className="bg-blue-500 text-white text-xl px-6 py-4 rounded-lg hover:cursor-pointer hover:scale-102 transition-transform duration-200"
                onClick={() => router.push("/map")}
            >
                Go to map
            </button>
        </section>
    );
}