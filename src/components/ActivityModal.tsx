import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { Activity } from "@/types/activity";

export default function ActivityModal({ isOpen, onClose, activity}: { isOpen: boolean; onClose: () => void; activity: Activity }) {
    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 z-10 bg-black/50"
            onClick={onClose}
        >
            <div 
                className="flex flex-col items-center justify-center min-h-screen"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-var(--bg-secondary) p-8 rounded-lg max-w-xl mx-4">

                </div>
            </div>
        </div>,
        document.body
    );
}