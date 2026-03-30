import { pgTable, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: varchar("id", { length: 10 }).primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  points: integer("points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  firstPointAt: integer("first_point_at"),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export const insertCustomerSchema = createInsertSchema(customers).extend({
  id: z.string().optional(),
}).omit({ createdAt: true });

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type CreateCustomerRequest = NewCustomer;
export type UpdateCustomerRequest = Partial<InsertCustomer>;

export const pointHistory = pgTable("point_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  t: integer("t").notNull(),
  cid: varchar("cid", { length: 10 }).notNull().references(() => customers.id),
  d: integer("d").notNull(),
});

export type PointHistoryRecord = typeof pointHistory.$inferSelect;

export const historyResponseSchema = z.object({
  t: z.number(),
  d: z.number(),
});
