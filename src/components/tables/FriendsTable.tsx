"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";

export default function FriendsTable() {
    const [friends, setFriends] = useState<any>([]);

    useEffect(() => {
        // Fetch friends data
        const fetchFriends = async () => {
            // Simulate API call
            const data = [
                { name: "John Doe", since: "2023-01-01" },
                { name: "Jane Smith", since: "2023-06-15" },
            ];
            setFriends(data);
        };

        fetchFriends();
    }, []);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Friend Name</TableHead>
                    <TableHead>Friends Since</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {/* Example row */}
                <TableRow>
                    <TableCell>John Doe</TableCell>
                    <TableCell>Accepted</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}