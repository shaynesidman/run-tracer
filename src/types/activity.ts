import { Timestamp } from "next/dist/server/lib/cache-handlers/types"

export type Activity = {
    id: number,
    time: string,
    type: string,
    points: Array<Array<string>>,
    distance: number,
    start: Array<string>,
    userId: string
}