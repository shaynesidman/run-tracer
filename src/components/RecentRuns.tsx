import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { type Activity } from "@/types/activity";
import LoadingSpinner from "./ui/LoadingSpinner";
import MiniMap from "./MiniMap";

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
        return (
            <div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentRuns.slice(-3).reverse().map((run: Activity) => (
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
        <div className="bg-[var(--bg-secondary)] text-base sm:text-lg md:text-xl w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg">
            <p className="w-full text-center">You have no recent runs.</p>
        </div>
    ); 
}