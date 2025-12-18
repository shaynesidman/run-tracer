'use client';

import Image from 'next/image';

const images = [
    '64997598742__133A1C9D-6AF0-43D9-BD4E-9F15A414C11B.jpeg',
    '65003251831__3691962D-E7F0-49C4-8BDF-01F991339D7E.jpeg',
    'IMG_0346.jpeg',
    'IMG_2172.jpeg',
    'IMG_2180.jpeg',
    'IMG_2355.jpeg',
    'IMG_2805.jpeg',
    'IMG_3183.jpeg',
    'IMG_4401.jpeg',
    'IMG_5860.jpeg',
    'IMG_8122.jpeg',
    'IMG_8180.jpeg',
    'IMG_8228.jpeg',
    'IMG_8313.jpeg',
    'IMG_8680.jpeg',
    'IMG_9911.jpeg',
];

export default function PhotoGallery() {
    return (
        <div className="w-full overflow-hidden py-8">
            <div className="flex gap-6 animate-scroll hover:pause-animation">
                {/* First set of images */}
                {images.map((image, index) => (
                    <div key={`img-1-${index}`} className="flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                        <Image
                            src={`/gallery/${image}`}
                            alt={`Gallery photo ${index + 1}`}
                            width={300}
                            height={300}
                            className="object-cover w-[300px] h-[300px] rounded-lg"
                        />
                    </div>
                ))}
                {/* Duplicate set for looping */}
                {images.map((image, index) => (
                    <div key={`img-2-${index}`} className="flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                        <Image
                            src={`/gallery/${image}`}
                            alt={`Gallery photo ${index + 1}`}
                            width={300}
                            height={300}
                            className="object-cover w-[300px] h-[300px] rounded-lg"
                        />
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .animate-scroll {
                    animation: scroll 20s linear infinite;
                }
            `}</style>
        </div>
    );
}
