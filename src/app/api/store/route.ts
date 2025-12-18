import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { activitiesTable } from "@/db/schema";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized: User not logged in" }, { status: 401 });
        }

        const { points, totalDistance, start, activityType } = await req.json();

        await db
            .insert(activitiesTable)
            .values({
                type: activityType,
                points: points,
                distance: totalDistance,
                start: start,
                userId: userId,
            });
        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error("Error storing activity:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}