import FriendsTable from "@/components/tables/FriendsTable";

export default function FriendsPage() {
    return (
        <div className="w-full px-2">
            <section>
                <h2 className="self-start text-xl font-bold">Friends</h2>
                <FriendsTable />
            </section>
            <section>
                <h2 className="self-start text-xl font-bold">Pending Friend Requests</h2>
            </section>
            <section>
                <h2 className="self-start text-xl font-bold">Incoming Friend Requests</h2>
            </section>
        </div>
    );
}