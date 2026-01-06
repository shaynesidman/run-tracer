import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { friendsTable } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "User is not logged in" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email || email.trim() === "") {
            return NextResponse.json(
                { error: "Email query is required" },
                { status: 400 }
            );
        }

        // Search for users by email using Clerk
        const client = await clerkClient();
        const users = await client.users.getUserList({
            emailAddress: [email],
        });

        // Filter out the current user
        const filteredUsers = users.data.filter((user) => user.id !== userId);

        // For each user, check friendship status
        const usersWithStatus = await Promise.all(
            filteredUsers.map(async (user) => {
                const friendship = await db
                    .select()
                    .from(friendsTable)
                    .where(
                        or(
                            and(
                                eq(friendsTable.requesterId, userId),
                                eq(friendsTable.addresseeId, user.id)
                            ),
                            and(
                                eq(friendsTable.requesterId, user.id),
                                eq(friendsTable.addresseeId, userId)
                            )
                        )
                    )
                    .limit(1);

                return {
                    id: user.id,
                    email: user.emailAddresses[0]?.emailAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    imageUrl: user.imageUrl,
                    friendshipStatus: friendship[0]?.status || null,
                    isRequester: friendship[0]?.requesterId === userId,
                };
            })
        );

        return NextResponse.json({ data: usersWithStatus }, { status: 200 });
    } catch (error) {
        console.error("Error searching users:", error);
        return NextResponse.json(
            { error: "Failed to search users" },
            { status: 500 }
        );
    }
}
