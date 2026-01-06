"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { handleAPIResponse } from "@/lib/apiClient";
import { type Friendship } from "@/types/friendship";
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
    const [friendships, setFriendships] = useState<Friendship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/friends", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const data = await handleAPIResponse<{ data: Friendship[] }>(res);
                setFriendships(data.data);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFriends();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (friendships.length === 0) {
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
                    <TableHead>Friend ID</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {friendships.map((friendship) => {
                    // Determine which ID is the friend (not the current user)
                    const friendId = friendship.requesterId === user?.id
                        ? friendship.addresseeId
                        : friendship.requesterId;

                    return (
                        <TableRow key={friendship.id}>
                            <TableCell>{friendId}</TableCell>
                            <TableCell>
                                {new Date(friendship.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <button className="text-red-500 hover:underline">
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
