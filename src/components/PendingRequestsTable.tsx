"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { handleAPIResponse } from "@/lib/apiClient";
import { type OutgoingFriendRequest } from "@/types/friendship";
import LoadingSpinner from "./ui/LoadingSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PendingRequestsTable() {
    const [requests, setRequests] = useState<OutgoingFriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/friends/requests/outgoing", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await handleAPIResponse<{ data: OutgoingFriendRequest[] }>(res);
            setRequests(data.data);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleCancel = async (friendshipId: number) => {
        try {
            const res = await fetch("/api/friends/reject", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendshipId }),
            });

            await handleAPIResponse(res);

            // Refetch requests after canceling
            await fetchRequests();
        } catch (error) {
            console.error(error);
            alert("Failed to cancel friend request");
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (requests.length === 0) {
        return (
            <div className="text-center p-4">
                <p>No pending friend requests</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.map((request) => {
                    const displayName = request.user.firstName && request.user.lastName
                        ? `${request.user.firstName} ${request.user.lastName}`
                        : request.user.email;

                    return (
                        <TableRow key={request.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {request.user.imageUrl && (
                                        <Image
                                            src={request.user.imageUrl}
                                            alt={displayName}
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    )}
                                    <span>{displayName}</span>
                                </div>
                            </TableCell>
                            <TableCell>{request.user.email}</TableCell>
                            <TableCell>
                                {new Date(request.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <button
                                    onClick={() => handleCancel(request.id)}
                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 duration-150"
                                >
                                    Cancel
                                </button>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
