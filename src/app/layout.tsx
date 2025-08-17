import type { Metadata } from "next";
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
    <html lang="en">
      <body className="relative h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
