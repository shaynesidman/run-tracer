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
                <body>
                    <main>
                        <div className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center">
                            <div className="min-h-[100dvh] w-full max-w-6xl flex flex-col gap-3">
                                <NavBar />
                                <div className="flex-1 flex justify-center items-center">
                                    {children}
                                </div>
                            </div>
                        </div>  
                    </main>
                </body>
            </html>
        </ClerkProvider>
    );
}
