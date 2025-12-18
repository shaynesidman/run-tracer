"use client";

import Link from "next/link";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";

export default function NavBar() {
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
}