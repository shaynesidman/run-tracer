import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    const { userId } = await auth();

    if (!userId) return NextResponse.json({ error: "User is not logged in" }, { status: 401 });

    const { data, error } = await supabase
        .from("activities")
        .select()
        .eq("userId", userId);
    
    if (error) return NextResponse.json({ error: "Postgres error"}, { status: 500 });

    return NextResponse.json({ data: data }, { status: 200 });
}