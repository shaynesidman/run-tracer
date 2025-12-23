import { db } from "@/db/db"; 
import { activitiesTable } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const data = await db.select().from(activitiesTable);

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching all activities" }, { status: 500 });
    }
}