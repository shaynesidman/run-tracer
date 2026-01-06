"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { handleAPIResponse } from "@/lib/apiClient";
import { type Friend } from "@/types/friendship";
import LoadingSpinner from "../ui/LoadingSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FriendsTable() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFriends = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/friends", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await handleAPIResponse<{ data: Friend[] }>(res);
            setFriends(data.data);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    const handleUnfriend = async (friendshipId: number) => {
        try {
            const res = await fetch("/api/friends/reject", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendshipId }),
            });

            await handleAPIResponse(res);

            // Refetch friends after unfriending
            await fetchFriends();
        } catch (error) {
            console.error(error);
            alert("Failed to unfriend");
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (friends.length === 0) {
        return (
            <div className="text-center p-4">
                <p>No friends yet. Start adding friends!</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Friend</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {friends.map((friend) => {
                    const displayName = friend.user.firstName && friend.user.lastName
                        ? `${friend.user.firstName} ${friend.user.lastName}`
                        : friend.user.email;

                    return (
                        <TableRow key={friend.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {friend.user.imageUrl && (
                                        <Image
                                            src={friend.user.imageUrl}
                                            alt={displayName}
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    )}
                                    <span>{displayName}</span>
                                </div>
                            </TableCell>
                            <TableCell>{friend.user.email}</TableCell>
                            <TableCell>
                                {new Date(friend.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <button
                                    onClick={() => handleUnfriend(friend.id)}
                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 duration-150"
                                >
                                    Unfriend
                                </button>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
