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
  updateCustomerHandler,
  getCustomerHistoryHandler,
  addPointsHandler,
  redeemPointsHandler,
} from "./handlers/customers.js";
import { loginHandler, meHandler } from "./handlers/auth.js";
import { runExpiry } from "./cron.js";
import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logout } from "@/lib/auth";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.customers.list.path, requireAuth, async (req, res) => {
    try {
      const allCustomers = await listCustomersHandler(storage, req.query);
      res.json(allCustomers);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get(api.customers.history.path, requireAuth, async (req, res) => {
    try {
      const history = await getCustomerHistoryHandler(storage, req.params.id as string, req.query);
      res.json(history);
    } catch (err: any) {
      if (err.message === "Invalid ID parameter") {
        return res.status(400).json({ message: err.message });
      }
      res.status(404).json({ message: err.message });
    }
  });

  app.get(api.customers.get.path, async (req, res) => {
    try {
      const customer = await getCustomerHandler(storage, req.params.id as string);
      res.json(customer);
    } catch (err: any) {
      if (err.message === "Invalid ID parameter") {
        return res.status(400).json({ message: err.message });
      }
      res.status(404).json({ message: err.message });
    }
  });

  app.get(api.customers.getByPhone.path, requireAuth, async (req, res) => {
    try {
      const customer = await getCustomerByPhoneHandler(storage, req.params.phone as string);
      res.json(customer);
    } catch (err: any) {
      if (err.message === "Invalid phone parameter") {
        return res.status(400).json({ message: err.message });
      }
      res.status(404).json({ message: err.message });
    }
  });

  app.post(api.customers.create.path, requireAuth, async (req, res) => {
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

  app.put(api.customers.update.path, requireAuth, async (req, res) => {
    try {
      const customer = await updateCustomerHandler(storage, req.params.id as string, req.body);
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

  app.post(api.customers.addPoints.path, requireAuth, async (req, res) => {
    try {
      const customer = await addPointsHandler(storage, req.params.id as string, req.body);
      res.status(200).json(customer);
    } catch (err: any) {
      if (err.message === "Customer not found") {
        return res.status(404).json({ message: err.message });
      }
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: err.message });
    }
  });

  app.post(api.customers.redeem.path, requireAuth, async (req, res) => {
    try {
      const customer = await redeemPointsHandler(storage, req.params.id as string);
      res.status(200).json(customer);
    } catch (err: any) {
      if (err.message === "Customer not found") {
        return res.status(404).json({ message: err.message });
      }
      if (err.message === "Insufficient points for redemption") {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/cron/expiry", async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: "Unauthorized cron request" });
      }
    }
    
    try {
      const result = await runExpiry();
      res.json(result);
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/config", (_req, res) => {
    res.json({
      pointsExpiryMonths: Math.max(1, parseInt(process.env.POINTS_EXPIRY_MONTHS || "12", 10) || 12),
    });
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

  app.get("/api/auth/me", async (req, res) => {
    res.json(await meHandler(req));
  });

  app.post("/api/auth/logout", async (req, res) => {
    res.json(await logout());
  });



  return httpServer;
}
