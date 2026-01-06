import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { friendsTable } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";

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
        const { addresseeId } = body;

        if (!addresseeId) {
            return NextResponse.json(
                { error: "addresseeId is required" },
                { status: 400 }
            );
        }

        // Check if friendship already exists
        const existingFriendship = await db
            .select()
            .from(friendsTable)
            .where(
                or(
                    and(
                        eq(friendsTable.requesterId, userId),
                        eq(friendsTable.addresseeId, addresseeId)
                    ),
                    and(
                        eq(friendsTable.requesterId, addresseeId),
                        eq(friendsTable.addresseeId, userId)
                    )
                )
            )
            .limit(1);

        if (existingFriendship.length > 0) {
            return NextResponse.json(
                { error: "Friendship or request already exists" },
                { status: 400 }
            );
        }

        // Create new friend request
        const newFriendship = await db
            .insert(friendsTable)
            .values({
                requesterId: userId,
                addresseeId: addresseeId,
                status: "pending",
            })
            .returning();

        return NextResponse.json({ data: newFriendship[0] }, { status: 201 });
    } catch (error) {
        console.error("Error creating friend request:", error);
        return NextResponse.json(
            { error: "Failed to create friend request" },
            { status: 500 }
        );
    }
}
