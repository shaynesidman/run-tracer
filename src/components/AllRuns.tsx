"use client";

import { useState, useEffect } from "react";
import { type Activity } from "@/types/activity";
import ActivityGrid from "./ActivityGrid";

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

    if (allRuns === null) {
        return;
    }

    // User has tracked at least one run
    if (allRuns.length > 0) {
        return <ActivityGrid activities={allRuns} />;
    }

    // User has not tracked any runs
    return (
        <div className="w-full bg-[var(--bg-secondary)] text-xl px-6 py-4 rounded-lg">
            <p className="w-full text-center">You have no runs.</p>
        </div>
    ); 
}