import { db } from "@/db/db"; 
import { friendsTable, activitiesTable } from "@/db/schema";
import { eq, or, and, desc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) { 
            return NextResponse.json({ error: "User is not logged in" }, { status: 401 });
        }

        const friends = await db
            .select()
            .from(friendsTable)
            .where(
                and(
                    or(
                        eq(friendsTable.requesterId, userId), 
                        eq(friendsTable.addresseeId, userId)), 
                    eq(friendsTable.status, 'accepted')));
        
        // Build set of friend IDs including the current user to fetch their activities
        const friendIdSet = new Set<string>(userId);
        friends.forEach((friend) => {
            friendIdSet.add(friend.requesterId);
            friendIdSet.add(friend.addresseeId);
        });

        // Fetch friend activities
        const activities = await db
            .select()
            .from(activitiesTable)
            .where(inArray(activitiesTable.userId, Array.from(friendIdSet)))
            .orderBy(desc(activitiesTable.time));

        return NextResponse.json({ data: activities }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching all activities" }, { status: 500 });
    }
}