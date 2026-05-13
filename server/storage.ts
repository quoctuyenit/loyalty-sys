import { db } from "./db.js";
import { customers, pointHistory, type CreateCustomerRequest, type UpdateCustomerRequest, type Customer } from "../shared/schema.js";
import { eq, ilike, or, desc, gt } from "drizzle-orm";

export interface IStorage {
  getCustomers(search?: string, limit?: number, offset?: number): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: CreateCustomerRequest): Promise<Customer>;
  updateCustomer(id: string, updates: UpdateCustomerRequest): Promise<Customer>;
  appendHistory(customerId: string, delta: number): Promise<void>;
  getCustomerHistory(customerId: string, limit?: number): Promise<{ t: number; d: number }[]>;
  getCustomersWithPoints(): Promise<Customer[]>;
  expireCustomer(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCustomers(search?: string, limit = 20, offset = 0): Promise<Customer[]> {
    const query = db.select().from(customers);
    search = search ? search.trim() : '';
    if (search) {
      return await query
        .where(or(ilike(customers.phone, `%${search}%`), ilike(customers.name, `%${search}%`)))
        .orderBy(desc(customers.createdAt))
        .limit(limit)
        .offset(offset);
    }
    return await query.orderBy(desc(customers.createdAt)).limit(limit).offset(offset);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
    return customer;
  }

  async createCustomer(customer: CreateCustomerRequest): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: string, updates: UpdateCustomerRequest): Promise<Customer> {
    const [updated] = await db.update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async appendHistory(customerId: string, delta: number): Promise<void> {
    const t = Math.floor(Date.now() / 1000);
    await db.insert(pointHistory).values({ t, cid: customerId, d: delta });
    if (delta > 0) {
      const customer = await this.getCustomer(customerId);
      if (customer && !customer.firstPointAt) {
        await db.update(customers).set({ firstPointAt: t }).where(eq(customers.id, customerId));
      }
    }
  }

  async getCustomersWithPoints(): Promise<Customer[]> {
    return await db.select().from(customers).where(gt(customers.points, 0));
  }

  async expireCustomer(id: string): Promise<void> {
    await db.delete(pointHistory).where(eq(pointHistory.cid, id));
    await db.delete(customers).where(eq(customers.id, id));
  }

  async getCustomerHistory(customerId: string, limit = 50): Promise<{ t: number; d: number }[]> {
    const rows = await db
      .select({ t: pointHistory.t, d: pointHistory.d })
      .from(pointHistory)
      .where(eq(pointHistory.cid, customerId))
      .orderBy(desc(pointHistory.t))
      .limit(limit);
    return rows;
  }
}

export const storage = new DatabaseStorage();
