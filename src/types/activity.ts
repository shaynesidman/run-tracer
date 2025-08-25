export type Activity = {
    id: number,
    time: string,
    type: string,
    points: Array<Array<string>>,
    distance: number,
    start: Array<string>,
    userId: string
}