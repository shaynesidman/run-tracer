import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { friendsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "User is not logged in" },
                { status: 401 }
            );
        }

        // Fetch all incoming friend requests (where current user is addressee and status is pending)
        const incomingRequests = await db
            .select()
            .from(friendsTable)
            .where(
                and(
                    eq(friendsTable.addresseeId, userId),
                    eq(friendsTable.status, 'pending')
                )
            );

        // Fetch user details for each requester
        const client = await clerkClient();
        const requestsWithUserInfo = await Promise.all(
            incomingRequests.map(async (request) => {
                try {
                    const user = await client.users.getUser(request.requesterId);
                    return {
                        id: request.id,
                        requesterId: request.requesterId,
                        createdAt: request.createdAt,
                        user: {
                            id: user.id,
                            email: user.emailAddresses[0]?.emailAddress || "",
                            firstName: user.firstName,
                            lastName: user.lastName,
                            imageUrl: user.imageUrl,
                        },
                    };
                } catch (error) {
                    console.error(`Failed to fetch user ${request.requesterId}:`, error);
                    return null;
                }
            })
        );

        // Filter out any failed user fetches
        const validRequests = requestsWithUserInfo.filter((req) => req !== null);

        return NextResponse.json({ data: validRequests }, { status: 200 });
    } catch (error) {
        console.error("Error fetching incoming requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch incoming requests" },
            { status: 500 }
        );
    }
}
