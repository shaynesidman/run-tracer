"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { type Activity } from "@/types/activity";
import MiniMap from "./MiniMap";
import LoadingSpinner from "./ui/LoadingSpinner";

export default function AllRuns() {
    const [allRuns, setAllRuns] = useState<Activity[] | null>(null);  // Initially null to prevent flashing due to empty array

    const { userId, isLoaded } = useAuth();

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
            setAllRuns(data.data.reverse());
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

    if (!isLoaded) {
        return <LoadingSpinner />;
    }
    
    // User is not signed in
    if (!userId) {
        return (
            <div className="text-xl text-center px-6 py-4 rounded-lg bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased">
                Sign in to see recent activity.
            </div>
        );
    }

    if (allRuns === null) {
        return <LoadingSpinner />;
    }
    

    // User has tracked at least one run
    if (allRuns.length > 0) {
        return (
            <div className="flex flex-wrap -mx-2">
                {allRuns.map((run: Activity) => (
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