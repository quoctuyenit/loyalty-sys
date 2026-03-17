import { api } from "../../shared/routes.js";
import { makeId } from "../utils.js";
import type { IStorage } from "../storage.js";

export async function listCustomersHandler(storage: IStorage, query: any) {
  const search = query.search as string | undefined;
  return await storage.getCustomers(search);
}

export async function getCustomerHandler(storage: IStorage, id: string) {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid ID parameter");
  }
  const customer = await storage.getCustomer(id);
  if (!customer) {
    throw new Error("Customer not found");
  }
  return customer;
}

export async function getCustomerByPhoneHandler(storage: IStorage, phone: string) {
  if (!phone || typeof phone !== "string") {
    throw new Error("Invalid phone parameter");
  }
  const customer = await storage.getCustomerByPhone(phone);
  if (!customer) {
    throw new Error("Customer not found");
  }
  return customer;
}

export async function createCustomerHandler(storage: IStorage, body: any) {
  const input = api.customers.create.input.parse(body);

  let newId = makeId();
  while (await storage.getCustomer(newId)) {
    newId = makeId();
  }

  const newCustomer = {
    ...input,
    id: newId,
  };
  const created = await storage.createCustomer(newCustomer);

  if (created.points && created.points !== 0) {
    await storage.appendHistory(created.id, created.points);
  }

  return created;
}

export async function updateCustomerHandler(storage: IStorage, id: string, body: any) {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid ID parameter");
  }
  const existing = await storage.getCustomer(id);
  if (!existing) {
    throw new Error("Customer not found");
  }

  const input = api.customers.update.input.parse(body);
  const updated = await storage.updateCustomer(id, input);

  if (typeof input.points === "number") {
    const delta = input.points - existing.points;
    if (delta !== 0) {
      await storage.appendHistory(id, delta);
    }
  }

  return updated;
}

export async function getCustomerHistoryHandler(storage: IStorage, id: string, query: any) {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid ID parameter");
  }
  const customer = await storage.getCustomer(id);
  if (!customer) {
    throw new Error("Customer not found");
  }
  const limitParam = parseInt(query.limit as string) || 50;
  const limit = Math.min(Math.max(1, limitParam), 200);
  return await storage.getCustomerHistory(id, limit);
}
