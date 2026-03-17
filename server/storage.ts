import { db } from "./db.js";
import { customers, pointHistory, type CreateCustomerRequest, type UpdateCustomerRequest, type Customer } from "../shared/schema.js";
import { eq, ilike, desc } from "drizzle-orm";

export interface IStorage {
  getCustomers(search?: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: CreateCustomerRequest): Promise<Customer>;
  updateCustomer(id: string, updates: UpdateCustomerRequest): Promise<Customer>;
  appendHistory(customerId: string, delta: number): Promise<void>;
  getCustomerHistory(customerId: string, limit?: number): Promise<{ t: number; d: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getCustomers(search?: string): Promise<Customer[]> {
    if (search) {
      return await db.select().from(customers).where(ilike(customers.phone, `%${search}%`));
    }
    return await db.select().from(customers);
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
