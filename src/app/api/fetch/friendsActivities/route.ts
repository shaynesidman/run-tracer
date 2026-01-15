import { db } from "@/db/db"; 
import { friendsTable } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) { 
            return NextResponse.json({ error: "User is not logged in" }, { status: 401 });
        }

        const data = await db
            .select()
            .from(friendsTable)
            .where(
                and(
                    or(
                        eq(friendsTable.requesterId, userId), 
                        eq(friendsTable.addresseeId, userId)), 
                    eq(friendsTable.status, 'accepted')));

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching all activities" }, { status: 500 });
    }
}