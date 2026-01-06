import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { friendsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: Request) {
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

        // Delete the friendship record
        const deleted = await db
            .delete(friendsTable)
            .where(eq(friendsTable.id, friendshipId))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json(
                { error: "Friendship not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: deleted[0] }, { status: 200 });
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        return NextResponse.json(
            { error: "Failed to reject friend request" },
            { status: 500 }
        );
    }
}
