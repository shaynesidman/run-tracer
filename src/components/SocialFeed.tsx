"use client";

import { useState, useEffect } from "react";
import { handleAPIResponse } from "@/lib/apiClient";
import { type Activity } from "@/types/activity";
import SocialPost from "./SocialPost";
import LoadingSpinner from "./ui/LoadingSpinner"

interface SocialFeedProps {
    onLoadingChange?: (isLoading: boolean) => void;
}

export default function SocialFeed({ onLoadingChange }: SocialFeedProps) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            setIsLoading(true);
            onLoadingChange?.(true);
            try {
                const res = await fetch("/api/fetch/activities", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                const data = await handleAPIResponse<{ data: Activity[] }>(res);
                setActivities(data.data);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
                onLoadingChange?.(false);
            }
        };

        fetchActivities();
    }, [onLoadingChange]);

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity: Activity) => (
                <SocialPost key={activity.id} activity={activity} />
            ))}
        </div>
    );
}