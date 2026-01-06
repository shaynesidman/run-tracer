import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { friendsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "User is not logged in" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { friendshipId } = body;

        if (!friendshipId) {
            return NextResponse.json(
                { error: "friendshipId is required" },
                { status: 400 }
            );
        }

        // Update the friendship status to 'accepted'
        const updated = await db
            .update(friendsTable)
            .set({ status: 'accepted' })
            .where(eq(friendsTable.id, friendshipId))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json(
                { error: "Friendship not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: updated[0] }, { status: 200 });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        return NextResponse.json(
            { error: "Failed to accept friend request" },
            { status: 500 }
        );
    }
}
