"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { handleAPIResponse } from "@/lib/apiClient";
import { type IncomingFriendRequest } from "@/types/friendship";
import LoadingSpinner from "../ui/LoadingSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function IncomingRequestsTable() {
    const [requests, setRequests] = useState<IncomingFriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/friends/requests/incoming", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await handleAPIResponse<{ data: IncomingFriendRequest[] }>(res);
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

    const handleAccept = async (friendshipId: number) => {
        try {
            const res = await fetch("/api/friends/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendshipId }),
            });

            await handleAPIResponse(res);

            toast.success("Friend request accepted");

            // Refetch requests after accepting
            await fetchRequests();
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept friend request");
        }
    };

    const handleReject = async (friendshipId: number) => {
        try {
            const res = await fetch("/api/friends/reject", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendshipId }),
            });

            await handleAPIResponse(res);

            toast.success("Friend request rejected");

            // Refetch requests after rejecting
            await fetchRequests();
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject friend request");
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (requests.length === 0) {
        return (
            <div className="text-center p-4">
                <p>No incoming friend requests</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="hidden md:table-cell">User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
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
                            <TableCell className="hidden md:table-cell">
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
                            <TableCell className="hidden md:table-cell">
                                {new Date(request.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col md:flex-row gap-2">
                                    <button
                                        onClick={() => handleAccept(request.id)}
                                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 duration-150"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.id)}
                                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 duration-150"
                                    >
                                        Deny
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
