import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
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

        // Fetch user details for each friend
        const client = await clerkClient();
        const friendsWithUserInfo = await Promise.all(
            friendships.map(async (friendship) => {
                // Determine which ID is the friend (not the current user)
                const friendId = friendship.requesterId === userId
                    ? friendship.addresseeId
                    : friendship.requesterId;

                try {
                    const friendUser = await client.users.getUser(friendId);
                    return {
                        id: friendship.id,
                        friendId: friendId,
                        createdAt: friendship.createdAt,
                        user: {
                            id: friendUser.id,
                            email: friendUser.emailAddresses[0]?.emailAddress || "",
                            firstName: friendUser.firstName,
                            lastName: friendUser.lastName,
                            imageUrl: friendUser.imageUrl,
                        },
                    };
                } catch (error) {
                    console.error(`Failed to fetch user ${friendId}:`, error);
                    return null;
                }
            })
        );

        // Filter out any failed user fetches
        const validFriends = friendsWithUserInfo.filter((friend) => friend !== null);

        return NextResponse.json({ data: validFriends }, { status: 200 });
    } catch (error) {
        console.error("Error fetching friends:", error);
        return NextResponse.json(
            { error: "Failed to fetch friends" },
            { status: 500 }
        );
    }
}
