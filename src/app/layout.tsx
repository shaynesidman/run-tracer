import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Run Tracer",
  description: "Simply draw a line and run",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
