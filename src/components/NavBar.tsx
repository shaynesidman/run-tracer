"use client";

import { useRouter } from "next/navigation";

export default function NavBar() {
    const router = useRouter();

    return (
        <nav className="w-full flex flex-row justify-between items-center p-4">
            <h1 className="text-2xl hover:cursor-pointer" onClick={() => router.push("/")}>RunTracer</h1>
            <div className="flex flex-row justify-center items-center">
                <h3 className="hover:cursor-pointer" onClick={() => router.push("/map")}>Map</h3>
            </div>
        </nav>
    );
}