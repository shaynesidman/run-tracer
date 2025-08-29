"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { type Activity } from "@/types/activity";
import MiniMap from "./MiniMap";

export default function AllRuns() {
    const [allRuns, setAllRuns] = useState<Activity[] | null>(null);  // Initially null to prevent flashing due to empty array

    const { userId, isLoaded } = useAuth();

    // User is not logged in
    if (!userId) {
        return (
            <div className="text-xl text-center px-6 py-4 rounded-lg bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased">
                Sign in to see recent activity.
            </div>
        );
    }

    useEffect(() => {
        if (isLoaded && userId) fetchActivities();
    }, [userId, isLoaded]);

    const fetchActivities = async () => {
        try {
            const res = await fetch("/api/fetch/allRuns", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();
            setAllRuns(data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const dateStr = date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit', 
            year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return `${dateStr} ${timeStr}`;
    };

    // Loading spinner
    if (!isLoaded || allRuns === null) {
        return (
            <div className="px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <svg 
                    className="animate-spin h-8 w-8 text-white/70" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                >
                    <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                    />
                    <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        );
    }

    // User has tracked at least one run
    if (allRuns.length > 0) {
        return (
            <div className="flex flex-wrap -mx-2">
                {allRuns.reverse().map((run: Activity) => (
                    <div key={run.id} className="w-full sm:w-1/2 md:w-1/3 px-2 mb-4">
                        <div className="flex items-center gap-4 text-xl px-6 py-4 rounded-lg bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased">
                            <div className="flex flex-col">
                                <p>{run.type}</p>
                                <p>{formatDate(run.time)}</p>
                                <p>{run.distance.toFixed(2)} mi</p>
                            </div>
                            <MiniMap activity={run} />
                        </div>
                    </div>
                ))}
            </div>
        );  
    }

    // User has not tracked any runs
    return (
        <div className="text-xl w-full px-6 py-4 rounded-lg bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased">
            <p className="w-full text-center">You have no recent runs.</p>
        </div>
    ); 
}