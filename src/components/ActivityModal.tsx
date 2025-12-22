import { createPortal } from "react-dom";
import { Activity } from "@/types/activity";
import { useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import MiniMap from "./MiniMap";
import ImageUpload from "./ImageUpload";
import useEscapeKey from "@/hooks/useEscapeKey";
import { formatDate } from "@/utils/formatDates";

export default function ActivityModal({ isOpen, onClose, activity}: { isOpen: boolean; onClose: () => void; activity: Activity }) {    
    // Close modal when escape key is pressed
    useEscapeKey(onClose);
    
    useEffect(() => {
        document.body.style.overflow = 'hidden'; // Disable scrolling when modal is open
        
        // Re-enable scrolling when modal closes or unmounts
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 z-10 bg-black/50"
            onClick={onClose}
        >
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div 
                    className="bg-[var(--bg-primary)] rounded-lg lg:w-md mx-4 flex flex-col gap-2 px-2 pb-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="pt-2 self-end hover:cursor-pointer" onClick={onClose}><IoIosClose /></div>
                    <div className="flex flex-col gap-4 px-2">
                        <div className="flex flex-col lg:flex-row gap-4"> 
                            <div className="lg:w-1/3 flex flex-row lg:flex-col justify-center items-center gap-8">
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
                            <MiniMap activity={activity} />
                        </div>
                        <ImageUpload />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}