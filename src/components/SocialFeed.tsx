"use client";

import { useState, useEffect } from "react";
import { handleAPIResponse } from "@/lib/apiClient";
import { type Activity } from "@/types/activity";

export default function SocialFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch("/api/fetch/activities", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                const data = await handleAPIResponse<{ data: Activity[] }>(res);
                setActivities(data.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchActivities();
    }, []);

    return (
        <></>
    );
}