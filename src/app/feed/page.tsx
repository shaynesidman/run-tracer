"use client";

import { useState } from "react";
import SocialFeed from "@/components/SocialFeed";

export default function FeedPage() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <section className="max-w-5xl mx-4 p-4 flex flex-col gap-4">
            {!isLoading && <h3 className="self-start text-xl font-bold">Recent Posts</h3>}
            <SocialFeed onLoadingChange={setIsLoading} />
        </section>
    );
}