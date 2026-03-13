import { storage } from "../storage";
import { api } from "@shared/routes";
import { makeId } from "../utils";

export async function listCustomers(search?: string) {
  return await storage.getCustomers(search);
}

export async function getCustomer(id: string) {
  const customer = await storage.getCustomer(id);
  if (!customer) {
    throw new Error("Customer not found");
  }
  return customer;
}

export async function getCustomerByPhone(phone: string) {
  const customer = await storage.getCustomerByPhone(phone);
  if (!customer) {
    throw new Error("Customer not found");
  }
  return customer;
}

export async function createCustomer(data: any) {
  const input = api.customers.create.input.parse(data);

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

export async function updateCustomer(id: string, data: any) {
  const input = api.customers.update.input.parse(data);
  return await storage.updateCustomer(id, input);
}
