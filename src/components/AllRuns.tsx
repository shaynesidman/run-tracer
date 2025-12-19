"use client";

import { useState, useEffect } from "react";
import { type Activity } from "@/types/activity";
import MiniMap from "./MiniMap";

export default function AllRuns() {
    const [allRuns, setAllRuns] = useState<Activity[] | null>(null);  // Initially null to prevent flashing due to empty array

    useEffect(() => {
        fetchActivities();
    }, []);

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
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (allRuns === null) {
        return;
    }

    // User has tracked at least one run
    if (allRuns.length > 0) {
        return (
            <div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allRuns.slice(-3).reverse().map((run: Activity) => (
                    <div key={run.id} className="bg-[var(--bg-secondary)] flex justify-center items-center gap-4 rounded-lg px-4 py-2 mb-4">
                        <div className="flex flex-col">
                            <p>{run.type}</p>
                            <p>{formatDate(run.time)}</p>
                            <p>{run.distance.toFixed(2)} mi</p>
                        </div>
                        <div className="w-28 h-28">
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