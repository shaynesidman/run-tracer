"use client";

import FriendsTable from "@/components/tables/FriendsTable";
import UserSearch from "@/components/UserSearch";
import IncomingRequestsTable from "@/components/tables/IncomingRequestsTable";
import PendingRequestsTable from "@/components/tables/PendingRequestsTable";
import { useAuth } from "@clerk/nextjs";

export default function FriendsPage() {
    const { userId } = useAuth();
    
    if (!userId) {
        return (
            <div className="w-full border border-[var(--bg-secondary)] text-center p-4 rounded-lg">
                Sign in to see account info and recent activity
            </div>
        );
    }

    return (
        <div className="w-full px-2 space-y-6">
            <section>
                <h2 className="self-start text-xl font-bold mb-4">Add Friends</h2>
                <UserSearch />
            </section>
            <section>
                <h2 className="self-start text-xl font-bold mb-4">Friends</h2>
                <FriendsTable />
            </section>
            <section>
                <h2 className="self-start text-xl font-bold mb-4">Incoming Friend Requests</h2>
                <IncomingRequestsTable />
            </section>
            <section>
                <h2 className="self-start text-xl font-bold mb-4">Pending Friend Requests</h2>
                <PendingRequestsTable />
            </section>
        </div>
    );
}