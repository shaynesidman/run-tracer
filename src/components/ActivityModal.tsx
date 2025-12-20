import { createPortal } from "react-dom";
import { Activity } from "@/types/activity";
import { useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import MiniMap from "./MiniMap";
import ImageUpload from "./ImageUpload";
import useEscapeKey from "@/hooks/useEscapeKey";

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
                    className="bg-[var(--bg-primary)] rounded-lg w-md mx-4 flex flex-col gap-2 px-2 pb-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="pt-2 self-end hover:cursor-pointer" onClick={onClose}><IoIosClose /></div>
                    <div className="flex gap-4"> 
                        <div className="flex flex-col">
                            <p>{activity.type}</p>
                            <p>{activity.time}</p>
                            <p>{activity.distance}</p>
                        </div>
                        <MiniMap activity={activity} />
                    </div>
                    <ImageUpload />
                </div>
            </div>
        </div>,
        document.body
    );
}