"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";

export default function NavBar() {
    const router = useRouter();

    return (
        <nav className="sticky top-2 z-10 w-full rounded-lg p-2">
            <div className="w-full flex justify-between items-center px-2">
                <Link href="/"><h1 className="text-2xl hover:cursor-pointer">RunTracer</h1></Link>
                <div className="flex flex-row justify-center items-center gap-3 sm:gap-4 md:gap-6">
                    <Link href="/map"><h3 className="hover:cursor-pointer">Map</h3></Link>
                    <Link href="/about"><h3 className="hover:cursor-pointer">About</h3></Link>
                    <Link href="/account"><h3 className="hover:cursor-pointer">Account</h3></Link>
                    <SignedOut>
                        <div className="hover:cursor-pointer"><SignInButton /></div>
                        <SignUpButton>
                            Sign Up
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );

    return (
        <nav className="sticky top-2 z-10 w-full bg-center rounded-md p-2">
            <div className="w-full inline-flex items-center justify-center sm:justify-between px-4 py-2 text-white rounded-lg bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none antialiased">
                <div className="hidden sm:block"><h1 className="text-2xl hover:cursor-pointer" onClick={() => router.push("/")}>RunTracer</h1></div>
                <div className="flex flex-row justify-center items-center gap-3 sm:gap-4 md:gap-6">
                    <div className="block sm:hidden"><h3 className="hover:cursor-pointer" onClick={() => router.push("/")}>Home</h3></div>
                    <Link href="/map"><h3 className="hover:cursor-pointer">Map</h3></Link>
                    <Link href="/about"><h3 className="hover:cursor-pointer">About</h3></Link>
                    <Link href="/account"><h3 className="hover:cursor-pointer">Account</h3></Link>
                    <SignedOut>
                        <div className="hover:cursor-pointer"><SignInButton /></div>
                        <SignUpButton>
                            Sign Up
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}