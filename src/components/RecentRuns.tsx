import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { type Activity } from "@/types/activity";
import LoadingSpinner from "./ui/LoadingSpinner";
import ActivityGrid from "./ActivityGrid";

export default function RecentRuns() {
    const [recentRuns, setRecentRuns] = useState<Activity[] | null>(null);  // Initially null to prevent flashing due to empty array

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
            setRecentRuns(data.data);
        } catch (error) {
            console.log(error);
        }
    };

    // Loading spinner
    if (!isLoaded) {
        return <LoadingSpinner />
    }

    // User is not logged in
    if (!userId) {
        return (
            <div className="w-full bg-[var(--bg-secondary)] text-base sm:text-lg md:text-xl text-center px-4 sm:px-6 py-3 sm:py-4 rounded-lg">
                Sign in to see recent activity.
            </div>
        );
    }

    if (recentRuns === null) {
        return <LoadingSpinner />;
    }

    // User has tracked at least one run; show most recent 3 runs
    if (recentRuns.length > 0) {
        return <ActivityGrid activities={recentRuns} />;
    }

    // User has not tracked any runs
    return (
        <div className="bg-[var(--bg-secondary)] text-base sm:text-lg md:text-xl w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg">
            <p className="w-full text-center">You have no recent runs.</p>
        </div>
    ); 
}