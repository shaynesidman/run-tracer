import { type Activity } from "@/types/activity";
import MiniMap from './MiniMap';

export default function ActivityCard({ activity }: { activity: Activity }) {
    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div key={activity.id} className="bg-[var(--bg-secondary)] flex justify-center items-center rounded-lg gap-12 px-4 py-2 mb-4">
            <div className="flex flex-col">
                <p>{activity.type}</p>
                <p>{formatDate(activity.time)}</p>
                <p>{formatTime(activity.time)}</p>
                <p>{activity.distance.toFixed(2)} miles</p>
            </div>
            <div className="w-32 h-32">
                <MiniMap activity={activity} />
            </div>
        </div>
    );
}