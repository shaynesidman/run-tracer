"use client";

import { type Activity } from "@/types/activity";
import { formatDateCompact } from "@/utils/formatDates";
import { handleAPIResponse } from "@/lib/apiClient";
import MiniMap from "./MiniMap";
import { useState, useEffect } from "react";

type UserData = {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string;
};

export default function SocialPost({ activity }: { activity: Activity }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/fetch/user?userId=${activity.userId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                const data = await handleAPIResponse<{ data: UserData }>(res);
                setUser(data.data);
            } catch (error) {
                console.log("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [activity.userId]);

    return (
        <div className="flex flex-col justify-center gap-4 p-4 border rounded-lg border-[var(--bg-secondary)]">
            <div className="flex items-center gap-3 pb-2 border-b border-[var(--bg-secondary)]">
                {loading ? (
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] animate-pulse" />
                ) : (
                    <img
                        src={user?.imageUrl}
                        alt={`${user?.firstName} ${user?.lastName}`}
                        className="w-10 h-10 rounded-full"
                    />
                )}
                <div className="flex flex-col">
                    {loading ? (
                        <>
                            <div className="h-4 w-24 bg-[var(--bg-secondary)] rounded animate-pulse mb-1" />
                            <div className="h-3 w-32 bg-[var(--bg-secondary)] rounded animate-pulse" />
                        </>
                    ) : (
                        <>
                            <p className="font-semibold">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </>
                    )}
                </div>
            </div>
            <div className="flex flex-row justify-center items-center gap-8">
                <div className="flex flex-col items-center text-center">
                    <p className="text-xs">Type</p>
                    <p>{activity.type}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <p className="text-xs">Date</p>
                    <p>{formatDateCompact(activity.time)}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <p className="text-xs">Distance (mi)</p>
                    <p>{activity.distance.toFixed(2)}</p>
                </div>
            </div>
            <div className="h-48 md:h-auto">
                <MiniMap activity={activity} />
            </div>
        </div>
    );
}