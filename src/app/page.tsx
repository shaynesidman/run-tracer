"use client";

import PhotoGallery from "@/components/PhotoGallery";
import RecentRuns from "@/components/RecentRuns";

export default function Home() {
    return (
        <section className="flex justify-center">
            <div className="h-full w-full mx-auto py-4 flex flex-col justify-center items-center gap-8">
                <h1 className="text-5xl font-semibold text-center">Welcome to RunTracer</h1>
                <p className="text-3xl text-center">Plan and track your runs, walks, bikes, and more with ease.</p>
                <p className="text-lg text-center">RunTracer is the simplest way to map your runs, walks, and bike rides. Whether you're training for a marathon, going on a casual stroll, or cycling new terrain, our intuitive map lets you draw your route and see your distance instantly.</p>
                <PhotoGallery />
                <RecentRuns />
            </div>
        </section>
    );
}
