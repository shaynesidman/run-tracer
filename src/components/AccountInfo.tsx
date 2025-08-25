"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import AllRuns from "./AllRuns";

export default function AccountInfo() {
    const [distance, setDistance] = useState(0);

    const { isLoaded, isSignedIn, user } = useUser();

    useEffect(() => {
        fetchAccountData();
    }, []);

    const fetchAccountData = async () => {
        try {
            const res = await fetch("/api/fetch/totalDistance", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const totalDistance = await res.json();
            setDistance(totalDistance.data);            
        } catch (error) {
            console.log(error);
        }
    };

    // Loading spinner
    if (!isLoaded) {
        return (
            <div className="w-full px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <svg 
                    className="animate-spin h-8 w-8 text-white/70" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                >
                    <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                    />
                    <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        );
    }

    // User is not signed in
    if (!isSignedIn) {
        return (
            <div className="w-full text-center px-4 py-8 text-white rounded-lg bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none antialiased">
                Sign in to see account info and recent activity.
            </div>
        );
    }

    return (
        <section className="w-full flex flex-col justify-center items-center gap-8 text-white">
            <div className="w-full px-4 py-2 flex flex-col justify-center gap-4 rounded-lg bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none antialiased">
                <div className="flex flex-row justify-between items-center gap-2">
                    <div>
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
                <p><span className="font-bold">Total Distance: </span>{distance.toFixed(2)} mi</p>
            </div>
            <AllRuns />
        </section>
    );
}