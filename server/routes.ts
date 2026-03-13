import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { makeId } from "./utils";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.customers.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const allCustomers = await storage.getCustomers(search);
    res.json(allCustomers);
  });

  app.get(api.customers.get.path, async (req, res) => {
    const customer = await storage.getCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  });

  app.get(api.customers.getByPhone.path, async (req, res) => {
    const customer = await storage.getCustomerByPhone(req.params.phone);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  });

  app.post(api.customers.create.path, async (req, res) => {
    try {
      const input = api.customers.create.input.parse(req.body);
      
      let newId = makeId();
      while (await storage.getCustomer(newId)) {
        newId = makeId();
      }

      const newCustomer = {
        ...input,
        id: newId,
      };
      const customer = await storage.createCustomer(newCustomer);
      res.status(201).json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.customers.update.path, async (req, res) => {
    try {
      const input = api.customers.update.input.parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, input);
      res.status(200).json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
