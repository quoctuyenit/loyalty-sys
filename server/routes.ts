import type { Express } from "express";
import { type Server } from "http";
import { api } from "../shared/routes.js";
import { z } from "zod";
import { storage } from "./storage.js";
import { 
  listCustomersHandler, 
  getCustomerHandler, 
  getCustomerByPhoneHandler, 
  createCustomerHandler, 
  updateCustomerHandler 
} from "./handlers/customers.js";
import { loginHandler } from "./handlers/auth.js";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.customers.list.path, async (req, res) => {
    try {
      const allCustomers = await listCustomersHandler(storage, req.query);
      res.json(allCustomers);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get(api.customers.get.path, async (req, res) => {
    try {
      const customer = await getCustomerHandler(storage, req.params.id);
      res.json(customer);
    } catch (err: any) {
      if (err.message === "Invalid ID parameter") {
        return res.status(400).json({ message: err.message });
      }
      res.status(404).json({ message: err.message });
    }
  });

  app.get(api.customers.getByPhone.path, async (req, res) => {
    try {
      const customer = await getCustomerByPhoneHandler(storage, req.params.phone);
      res.json(customer);
    } catch (err: any) {
      if (err.message === "Invalid phone parameter") {
        return res.status(400).json({ message: err.message });
      }
      res.status(404).json({ message: err.message });
    }
  });

  app.post(api.customers.create.path, async (req, res) => {
    try {
      const customer = await createCustomerHandler(storage, req.body);
      res.status(201).json(customer);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: err.message });
    }
  });

  app.put(api.customers.update.path, async (req, res) => {
    try {
      const customer = await updateCustomerHandler(storage, req.params.id, req.body);
      res.status(200).json(customer);
    } catch (err: any) {
      if (err.message === "Invalid ID parameter") {
        return res.status(400).json({ message: err.message });
      }
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = await loginHandler(req.body);
      res.json(result);
    } catch (err: any) {
      if (err.message === "Server not configured") {
        return res.status(500).json({ success: false, message: err.message });
      }
      return res.status(401).json({ success: false, message: err.message });
    }
  });

  return httpServer;
}
