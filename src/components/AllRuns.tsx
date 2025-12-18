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
        return <></>;
    }

    if (allRuns === null) {
        return <LoadingSpinner />;
    }
    

    // User has tracked at least one run
    if (allRuns.length > 0) {
        return (
            <div className="flex flex-wrap">
                {allRuns.map((run: Activity) => (
                    <div key={run.id} className="w-full bg-[var(--bg-secondary)] flex justify-center items-center gap-4 rounded-lg px-4 py-2 mb-4">
                        <div className="flex justify-center items-center gap-4">
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
        <div className="w-full bg-[var(--bg-secondary)] text-xl px-6 py-4 rounded-lg">
            <p className="w-full text-center">You have no recent runs.</p>
        </div>
    ); 
}