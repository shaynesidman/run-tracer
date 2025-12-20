import { useRef, useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import { FaPlus } from "react-icons/fa";

export default function ImageUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Handle file selection w/ potentially multiple images
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPreviews: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const url = URL.createObjectURL(files[i]);
            newPreviews.push(url);
        }

        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    // Remove individual image
    const removeImage = (index: number) => {
        setImagePreviews((prev) => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]); // Clean up memory
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    return (
        <div className="border border-black rounded-lg h-32">
            {/* Hidden input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />

            {imagePreviews.length === 0 ? (
                // No images, so show upload button
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full p-2 hover:cursor-pointer"
                >
                    Upload Images
                </button>
            ) : (
                // Has images, so show horizontal scrollable list with plus button
                <div
                    className="flex gap-2 h-full overflow-x-auto p-2"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative flex-shrink-0 h-full">
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-auto object-contain rounded"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded hover:bg-black/70 hover:cursor-pointer duration-150"
                            >
                                <IoIosClose size={20} />
                            </button>
                        </div>
                    ))}
                    {/* Plus button at the end */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 h-full w-20 flex items-center justify-center border border-dashed border-black rounded hover:bg-[var(--bg-secondary)] hover:cursor-pointer duration-150"
                    >
                        <FaPlus size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}