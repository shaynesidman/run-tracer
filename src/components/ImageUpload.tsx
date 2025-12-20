import { useRef, useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import { MdDriveFolderUpload } from "react-icons/md";

export default function ImageUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const previewsRef = useRef<string[]>([]);

    // Handle file selection w/ potentially multiple images
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Convert FileList to array and create preview URLs
        const fileArray = Array.from(files);
        const newPreviews = fileArray.map((file) => URL.createObjectURL(file));

        setImagePreviews((prev) => [...prev, ...newPreviews]);
        previewsRef.current = [...previewsRef.current, ...newPreviews];

        // Reset input so same files can be selected again
        e.target.value = '';
    };

    // Remove individual image
    const removeImage = (index: number) => {
        const urlToRevoke = imagePreviews[index];
        URL.revokeObjectURL(urlToRevoke); // Clean up memory

        setImagePreviews((prev) => {
            const newPreviews = [...prev];
            newPreviews.splice(index, 1);
            return newPreviews;
        });

        previewsRef.current = previewsRef.current.filter(url => url !== urlToRevoke);
    };

    // Cleanup object URLs on unmount only
    useEffect(() => {
        return () => {
            previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    return (
        <div className="border border-[var(--bg-secondary)] rounded-lg h-32 w-full">
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
                    className="w-full h-full p-2 hover:cursor-pointer flex flex-col justify-center items-center gap-2"
                >
                    <MdDriveFolderUpload size={32} />
                    <p className="text-sm">Upload Images</p>
                </button>
            ) : (
                // Has images, so show horizontal scrollable list with plus button
                <div className="flex gap-2 h-full overflow-x-auto p-2 scrollbar-hide">
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
                        onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                        }}
                        className="flex-shrink-0 h-full w-20 flex items-center justify-center border border-dashed border-[var(--bg-secondary)] rounded hover:bg-[var(--bg-secondary)] hover:cursor-pointer duration-150"
                    >
                        <FaPlus size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}