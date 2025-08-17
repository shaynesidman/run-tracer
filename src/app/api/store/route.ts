import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    const userId = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized: User not logged in" }, { status: 401 });
    }

    const { points, totalDistance, start } = await req.json();

    const { error } = await supabase
        .from("activities")
        .insert({ type: "run", points: points, distance: totalDistance, start: start, userId: userId });
        
    if (error) {
        return NextResponse.json({ error: "Postgres error"}, { status: 500 });
    }

    return NextResponse.json({ status: 200 });
}