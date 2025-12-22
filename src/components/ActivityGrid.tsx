import { type Activity } from "@/types/activity";
import ActivityCard from "./ActivityCard";

export default function ActivityGrid({ activities, onlyRecent }: { activities: Activity[], onlyRecent: boolean }) {
    
    if (onlyRecent) {
        return (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.slice(-3).reverse().map((activity: Activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                ))}
            </div>
        );
    } else {
        return (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.reverse().map((activity: Activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                ))}
            </div>
        );
    }
}