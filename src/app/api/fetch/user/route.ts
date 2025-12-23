import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        return NextResponse.json({
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.emailAddresses[0]?.emailAddress,
                imageUrl: user.imageUrl,
            }
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }
}
