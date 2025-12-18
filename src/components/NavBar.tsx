"use client";

import Link from "next/link";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

export default function NavBar() {
    const { isSignedIn } = useAuth();

    return (
        <nav className="sticky top-2 z-10 w-full py-2 bg-[var(--bg-secondary)] flex justify-center items-center">
            <div className={`max-w-5xl w-full flex ${isSignedIn ? "justify-between" : "justify-center"} items-center px-2`}>
                {isSignedIn &&<Link href="/"><h1 className="text-2xl hover:cursor-pointer">RunTracer</h1></Link>}
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
}