"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { handleAPIResponse } from "@/lib/apiClient";
import { type UserSearchResult } from "@/types/user";
import LoadingSpinner from "./ui/LoadingSpinner";

export default function UserSearch() {
    const [email, setEmail] = useState("");
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter an email address");
            return;
        }

        try {
            setIsSearching(true);
            const res = await fetch(`/api/users/search?email=${encodeURIComponent(email)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await handleAPIResponse<{ data: UserSearchResult[] }>(res);
            setSearchResults(data.data);

            if (data.data.length === 0) {
                toast.error("No users found with that email");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to search users");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSendRequest = async (userId: string) => {
        try {
            const res = await fetch("/api/friends/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addresseeId: userId }),
            });

            await handleAPIResponse(res);

            toast.success("Friend request sent");

            // Update the search results to reflect the new status
            setSearchResults((prev) =>
                prev.map((user) =>
                    user.id === userId
                        ? { ...user, friendshipStatus: "pending", isRequester: true }
                        : user
                )
            );
        } catch (error) {
            console.error(error);
            toast.error("Failed to send friend request");
        }
    };

    const getButtonText = (user: UserSearchResult) => {
        if (!user.friendshipStatus) return "Add Friend";
        if (user.friendshipStatus === "pending") {
            return user.isRequester ? "Request Sent" : "Accept Request";
        }
        if (user.friendshipStatus === "accepted") return "Friends";
        return "Add Friend";
    };

    const isButtonDisabled = (user: UserSearchResult) => {
        return user.friendshipStatus === "pending" || user.friendshipStatus === "accepted";
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Search by email..."
                        className="flex-1 px-4 py-2 border border-[var(--bg-secondary)] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed duration-150"
                    >
                        {isSearching ? "Searching..." : "Search"}
                    </button>
                </div>
            </form>

            {isSearching && (
                <div className="flex justify-center py-8">
                    <LoadingSpinner />
                </div>
            )}

            {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2">
                    {searchResults.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between p-4 border border-[var(--bg-secondary)] rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                {user.imageUrl && (
                                    <Image
                                        src={user.imageUrl}
                                        alt={user.email}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                )}
                                <div>
                                    <p className="font-medium">
                                        {user.firstName && user.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user.email}
                                    </p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSendRequest(user.id)}
                                disabled={isButtonDisabled(user)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed duration-150"
                            >
                                {getButtonText(user)}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
