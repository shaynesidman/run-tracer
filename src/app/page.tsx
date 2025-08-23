"use client";

import { useRouter } from "next/navigation";
import RecentRuns from "@/components/RecentRuns";

export default function Home() {
    const router = useRouter();

    return (
        <section className="bg-fixed bg-gradient-to-br from-green-900 via-zinc-800 to-zinc-800 h-full flex justify-center">
            <div className="h-full max-w-5xl mx-auto p-4 flex flex-col justify-center items-center gap-6 text-white">
                <p className="text-3xl text-center">Plan and track your runs, walks, bikes, and more with ease.</p>
                <p className="textl-lg text-center">Welcome to RunTracer – the simplest way to map your runs, walks, and bike rides. Whether you're training for a marathon, going on a casual stroll, or cycling new terrain, our intuitive map lets you draw your route and see your distance instantly.</p>
                <button 
                    className="text-xl text-center px-6 py-4 rounded-lg bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] hover:bg-white/20 hover:cursor-pointer before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased"
                    onClick={() => router.push("/map")}
                >
                    Go to map
                </button>
                <RecentRuns />
            </div>
        </section>
    );
}
