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
                        <div className="w-full min-h-[100dvh] flex flex-col gap-3 bg-fixed bg-gradient-to-br from-sky-800 via-zinc-800 to-zinc-800">
                            <NavBar />
                            <div className="flex-1 flex justify-center items-center">
                                {children}
                            </div>
                        </div>  
                    </main>
                </body>
            </html>
        </ClerkProvider>
    );
}
