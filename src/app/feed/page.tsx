import SocialFeed from "@/components/SocialFeed";

export default function FeedPage() {
    return (
        <section className="max-w-5xl mx-4 p-4 flex flex-col gap-4">
            <h3 className="self-start text-xl font-bold">Recent Posts</h3>
            <SocialFeed />
        </section>
    );
}