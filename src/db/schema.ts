import { pgTable, serial, text, timestamp, real } from "drizzle-orm/pg-core";

export const activitiesTable = pgTable("activities", {
    id: serial("id").notNull().primaryKey(),
    time: timestamp("time").defaultNow().notNull(),
    type: text("type").notNull(),
    points: text("points").notNull().array().array(),
    distance: real("distance").notNull(),
    start: text("start").notNull().array(),
    userId: text("userId").notNull(),
});