import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
    title: "RunTracer | Plan and track your runs",
    description: "Simply draw a line and run",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className="h-screen flex flex-col">
                    <NavBar />
                    <main className="flex-1 bg-fixed bg-gradient-to-br from-green-900 via-zinc-800 to-zinc-800">
                        {children}
                    </main>
                </body>
            </html>
        </ClerkProvider>
    );
}
