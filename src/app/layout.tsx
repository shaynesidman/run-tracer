import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "@/components/NavBar";
import "./globals.css";
import { Toaster } from "sonner";

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
                            <div className="min-h-screen w-full flex flex-col items-center gap-4">
                                <NavBar />
                                <div className="w-full max-w-5xl flex-1 flex justify-center">
                                    {children}
                                    <Toaster
                                        richColors
                                        toastOptions={{
                                            style: {
                                                border: "1px solid red"
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>  
                    </main>
                </body>
            </html>
        </ClerkProvider>
    );
}
