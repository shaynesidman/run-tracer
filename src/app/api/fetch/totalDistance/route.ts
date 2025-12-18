import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { activitiesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const { userId } = await auth();
    
        if (!userId) return NextResponse.json({ error: "User is not logged in" }, { status: 401 });
    
        const data = await db.select()
            .from(activitiesTable)
            .where(eq(activitiesTable.userId, userId));
    
        return NextResponse.json({ data: data.reduce((acc, row) => acc + row.distance, 0) }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch total distance" }, { status: 500 });
    }
}