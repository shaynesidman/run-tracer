import { type Activity } from "@/types/activity";
import { formatDate } from "@/utils/formatDates";
import MiniMap from "./MiniMap";

export default function SocialPost({ activity }: { activity: Activity }) {
    return (
        <div className="flex flex-col justify-center gap-4 p-4 border rounded-lg border-[var(--bg-secondary)]">
            <div className="flex flex-row justify-center items-center gap-8">
                <div className="flex flex-col items-center text-center">
                    <p className="text-xs">Type</p>
                    <p>{activity.type}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <p className="text-xs">Date</p>
                    <p>{formatDate(activity.time)}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <p className="text-xs">Distance (mi)</p>
                    <p>{activity.distance.toFixed(2)}</p>
                </div>
            </div>
            <div className="h-48 md:h-auto">
                <MiniMap activity={activity} />
            </div>
        </div>
    );
}