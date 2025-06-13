import type { Metadata } from "next";
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
      <body>
        {children}
      </body>
    </html>
  );
}
