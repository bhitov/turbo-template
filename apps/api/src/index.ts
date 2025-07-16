import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import usersRouter from "./routes/users.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { RPCHandler } from '@orpc/server/node'
import { CORSPlugin } from '@orpc/server/plugins'
import { router } from './routes/orpc.js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Security and performance middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// oRPC API setup
const orpcHandler = new RPCHandler(router, {
  plugins: [new CORSPlugin()]
});

// oRPC API routes - mounted at /api prefix
app.use('/api/*', async (req, res, next) => {
  try {
    const result = await orpcHandler.handle(req, res, {
      prefix: '/api',
      context: { headers: req.headers },
    });
    
    if (!result.matched) {
      next(); // Let other Express routes handle unmatched requests
    }
  } catch (error) {
    console.error('oRPC handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// JSON middleware for REST routes only (doesn't interfere with oRPC)
app.use("/api/users", express.json({ limit: "10mb" }));

// REST API routes
app.use("/api/users", usersRouter);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
