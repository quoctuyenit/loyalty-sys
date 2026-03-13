import { storage } from "../storage.js";
import { api } from "@shared/routes.js";
import { makeId } from "../utils.js";

export async function listCustomersHandler(query: any) {
  const search = query.search as string | undefined;
  return await storage.getCustomers(search);
}

export async function getCustomerHandler(id: string) {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid ID parameter");
  }
  const customer = await storage.getCustomer(id);
  if (!customer) {
    throw new Error("Customer not found");
  }
  return customer;
}

export async function getCustomerByPhoneHandler(phone: string) {
  if (!phone || typeof phone !== "string") {
    throw new Error("Invalid phone parameter");
  }
  const customer = await storage.getCustomerByPhone(phone);
  if (!customer) {
    throw new Error("Customer not found");
  }
  return customer;
}

export async function createCustomerHandler(body: any) {
  // Pass zod validation logic to handlers instead of throwing in Express
  const input = api.customers.create.input.parse(body);

  let newId = makeId();
  while (await storage.getCustomer(newId)) {
    newId = makeId();
  }

  const newCustomer = {
    ...input,
    id: newId,
  };
  return await storage.createCustomer(newCustomer);
}

export async function updateCustomerHandler(id: string, body: any) {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid ID parameter");
  }
  const input = api.customers.update.input.parse(body);
  return await storage.updateCustomer(id, input);
}
