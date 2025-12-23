import { type Activity } from "@/types/activity";
import MiniMap from "./MiniMap";

export default function SocialPost({ activity }: { activity: Activity }) {
    return (
        <div className="flex flex-row gap-8">
            <div className="flex flex-col">
                <p>{activity.type}</p>
                <p>{activity.time}</p>
                <p>{activity.distance}</p>
            </div>
            <MiniMap activity={activity} />
            
        </div>
    );
}