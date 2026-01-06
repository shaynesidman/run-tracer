"use client";

import Link from 'next/link'; 
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AccountSidebar() {
    const pathname = usePathname();

    const [selectedTab, setSelectedTab] = useState(pathname);

    useEffect(() => {
        setSelectedTab(pathname);
    }, [pathname]);
    
    return (
        <aside className="h-full self-start border-r border-[var(--bg-secondary)] flex flex-col gap-4 p-4">
            <Link href="/account/info" className={selectedTab === "/account/info" ? "font-bold" : ""}>Account</Link>
            <Link href="/account/allRuns" className={selectedTab === "/account/allRuns" ? "font-bold" : ""}>History</Link>
            <Link href="/account/friends" className={selectedTab === "/account/friends" ? "font-bold" : ""}>Friends</Link>
        </aside>
    );
}