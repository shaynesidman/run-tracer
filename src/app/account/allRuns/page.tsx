import AllRuns from "@/components/AllRuns";
import Link from "next/link";

export default function AccountAllRuns() {
    return (
        <div className="w-full h-full flex flex-col">
            <AllRuns />
            <Link href="/map" className="w-full bg-[var(--bg-secondary)] text-center p-2 rounded-lg">
                Go to map to add more runs
            </Link>
        </div>
    );
}