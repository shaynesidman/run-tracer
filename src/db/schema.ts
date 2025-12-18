import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const activitiesTable = pgTable("activities", {
    id: serial("id").notNull().primaryKey(),
    time: timestamp("time").defaultNow().notNull(),
    type: text("type").notNull(),
    points: integer("points").notNull().array(),
    distance: integer("distance").notNull(),
    start: integer("start").notNull().array(),
    userId: text("userId").notNull(),
});