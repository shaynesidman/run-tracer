import FriendsTable from "@/components/tables/FriendsTable";
import UserSearch from "@/components/UserSearch";
import IncomingRequestsTable from "@/components/IncomingRequestsTable";

export default function FriendsPage() {
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
                <h2 className="self-start text-xl font-bold">Pending Friend Requests</h2>
            </section>
        </div>
    );
}