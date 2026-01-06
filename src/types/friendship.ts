export type Friendship = {
    id: number;
    requesterId: string;
    addresseeId: string;
    status: string;
    createdAt: Date;
}

export type IncomingFriendRequest = {
    id: number;
    requesterId: string;
    createdAt: Date;
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string;
    };
}

export type OutgoingFriendRequest = {
    id: number;
    addresseeId: string;
    createdAt: Date;
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string;
    };
}
