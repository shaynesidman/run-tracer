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

        // Fetch all outgoing friend requests (where current user is requester and status is pending)
        const outgoingRequests = await db
            .select()
            .from(friendsTable)
            .where(
                and(
                    eq(friendsTable.requesterId, userId),
                    eq(friendsTable.status, 'pending')
                )
            );

        // Fetch user details for each addressee
        const client = await clerkClient();
        const requestsWithUserInfo = await Promise.all(
            outgoingRequests.map(async (request) => {
                try {
                    const user = await client.users.getUser(request.addresseeId);
                    return {
                        id: request.id,
                        addresseeId: request.addresseeId,
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
                    console.error(`Failed to fetch user ${request.addresseeId}:`, error);
                    return null;
                }
            })
        );

        // Filter out any failed user fetches
        const validRequests = requestsWithUserInfo.filter((req) => req !== null);

        return NextResponse.json({ data: validRequests }, { status: 200 });
    } catch (error) {
        console.error("Error fetching outgoing requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch outgoing requests" },
            { status: 500 }
        );
    }
}
