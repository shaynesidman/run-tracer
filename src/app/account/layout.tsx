import AccountSidebar from "@/components/AccountSidebar";

export default function AccountLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <section className="h-full w-full max-w-5xl px-4 py-8 mx-auto flex justify-center items-center gap-8">
            <AccountSidebar />
            <div className="w-full h-full flex flex-col justify-center items-center gap-8">
                {children}
            </div>
        </section>
    );
}