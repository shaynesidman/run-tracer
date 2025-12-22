"use client";

import { useState, useEffect } from "react";
import { type Activity } from "@/types/activity";
import ActivityGrid from "./ActivityGrid";
import { handleAPIResponse } from "@/lib/apiClient";

export default function AllRuns() {
    const [allRuns, setAllRuns] = useState<Activity[] | null>(null);  // Initially null to prevent flashing due to empty array

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch("/api/fetch/allRun", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                const data = await handleAPIResponse<{ data: Activity[] }>(res);
                setAllRuns(data.data.reverse());
            } catch (error) {
                console.log(error);
            }
        };

        fetchActivities();
    }, []);

    if (allRuns === null) {
        return;
    }

    // User has tracked at least one run
    if (allRuns.length > 0) {
        return <ActivityGrid activities={allRuns} />;
    }

    // User has not tracked any runs
    return (
        <div className="w-full border border-[var(--bg-secondary)] text-xl px-6 py-4 rounded-lg">
            <p className="w-full text-center">You have no runs</p>
        </div>
    ); 
}