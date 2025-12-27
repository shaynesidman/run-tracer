"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import { type Activity } from "@/types/activity";
import LoadingSpinner from "./ui/LoadingSpinner";
import { handleAPIResponse } from "@/lib/apiClient";
import WeeklyActivityGraph from "./WeeklyActivityGraph";

export default function AccountInfo() {
    const [distance, setDistance] = useState(0);
    const [totalActivities, setTotalActivities] = useState(0);

    const { isLoaded, isSignedIn, user } = useUser();

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const res = await fetch("/api/fetch/allRuns", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const allRuns = await handleAPIResponse<{ data: Activity[] }>(res);
                setDistance(allRuns.data.reduce((acc: number, row: Activity) => acc + row.distance, 0));
                setTotalActivities(allRuns.data.length);           
            } catch (error) {
                console.log(error);
            }
        };

        fetchAccountData();
    }, []);

    // Loading spinner
    if (!isLoaded) {
        return (
            <LoadingSpinner />
        );
    }

    // User is not signed in
    if (!isSignedIn) {
        return (
            <div className="w-full border border-[var(--bg-secondary)] text-center p-4 rounded-lg">
                Sign in to see account info
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4 flex flex-col justify-center gap-4 rounded-lg text-">
            <div className="w-full flex flex-col-reverse lg:flex-row justify-between items-center gap-2">
                <div className="w-full">
                    {(user.firstName || user.lastName) && (
                        <p>
                            <span className="font-bold">Name: </span>
                            {user.firstName && <span>{user.firstName} </span>}
                            {user.lastName && <span>{user.lastName}</span>}
                        </p>
                    )}
                    {user.primaryEmailAddress?.emailAddress && (
                        <p>
                            <span className="font-bold">Email: </span>
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                    )}
                    {user.primaryPhoneNumber?.phoneNumber && (
                        <p>
                            <span className="font-bold">Phone Number: </span>
                            {user.primaryPhoneNumber?.phoneNumber}
                        </p>
                    )}
                </div>
                {user.imageUrl && (
                    <Image src={user.imageUrl} alt="No image" width={50} height={50} className="rounded-full" />
                )}
            </div>
            <div>
                <p><span className="font-bold">Total Distance: </span>{distance.toFixed(2)} mi</p>
                <p><span className="font-bold">Total Activities: </span>{totalActivities}</p>
            </div>
            <div>
                <h3 className="text-lg font-bold mb-4">Weekly Distance (Last 12 Weeks)</h3>
                <div className="w-full border border-[var(--bg-secondary)] rounded-lg p-4">
                    <WeeklyActivityGraph />
                </div>
            </div>
        </div>
    );
}