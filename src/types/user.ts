export type UserData = {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string;
};

export type UserSearchResult = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    friendshipStatus: string | null;
    isRequester: boolean;
}