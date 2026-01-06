import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { friendsTable } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "User is not logged in" },
                { status: 401 }
            );
        }

        // Fetch all friendships where current user is involved and status is 'accepted'
        const friendships = await db
            .select()
            .from(friendsTable)
            .where(
                and(
                    or(
                        eq(friendsTable.requesterId, userId),
                        eq(friendsTable.addresseeId, userId)
                    ),
                    eq(friendsTable.status, 'accepted')
                )
            );

        return NextResponse.json({ data: friendships }, { status: 200 });
    } catch (error) {
        console.error("Error fetching friends:", error);
        return NextResponse.json(
            { error: "Failed to fetch friends" },
            { status: 500 }
        );
    }
}
