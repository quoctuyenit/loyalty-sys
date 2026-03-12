import express from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Use rawBody middleware for parsing webhooks or normal json
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

// Setup routes
registerRoutes(httpServer, app);

// Vercel serverless functions require the express app to be exported
export default app;
