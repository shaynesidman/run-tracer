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

export const friendsTable = pgTable("friends", {
    id: serial("id").notNull().primaryKey(),
    requesterId: text("requesterId").notNull(),
    addresseeId: text("addresseeId").notNull(),
    status: text("status").notNull(),
});