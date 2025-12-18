"use client";

import PhotoGallery from "@/components/PhotoGallery";
import RecentRuns from "@/components/RecentRuns";

export default function Home() {
    return (
        <section className="flex justify-center px-4 sm:px-6 lg:px-8">
            <div className="h-full w-full max-w-5xl mx-auto py-4 flex flex-col justify-center items-center gap-4 sm:gap-6 lg:gap-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center">Welcome to RunTracer</h1>
                <p className="text-xl sm:text-2xl md:text-3xl text-center">Plan and track your runs, walks, bikes, and more with ease.</p>
                <p className="text-base sm:text-lg text-center px-2">RunTracer is the simplest way to map your runs, walks, and bike rides. Whether you're training for a marathon, going on a casual stroll, or cycling new terrain, our intuitive map lets you draw your route and see your distance instantly.</p>
                <PhotoGallery />
                <RecentRuns />
            </div>
        </section>
    );
}
