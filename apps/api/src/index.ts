import express, { type Express } from "express";
import cors from "cors";
import { toUint8Array } from 'crossws';
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { createServer } from 'node:http';
import { Server as IOServer } from 'socket.io';
import usersRouter from "./routes/users.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { RPCHandler as HttpHandler } from '@orpc/server/node'  // HTTP → Express
import { RPCHandler as WsHandler } from '@orpc/server/ws'  // HTTP → Express
// import { createHandler as createWsHandler } from '@orpc/server/ws'
import { CORSPlugin } from '@orpc/server/plugins'
import { router } from './routes/orpc.js'
import { streamingRouter } from './routes/streaming.js';
import { experimental_RPCHandler as RPCHandler } from '@orpc/server/crossws'



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
const orpcHandler = new HttpHandler(router, {
  plugins: [new CORSPlugin()]
});

// oRPC Streaming setup with WebSocket
const streamingHandle = new WsHandler(streamingRouter);
const streamingHandler = new RPCHandler(streamingRouter);
// const streamingHandler = createWsHandler({
//   router: streamingRouter
// });

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
  // Create HTTP server for both Express and Socket.IO
  const server = createServer(app);
  
  // Create Socket.IO server
  const io = new IOServer(server, { 
    path: '/socket.io',
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', socket => {
    /* minimal interface oRPC needs */
    const peer = {
      send : (msg: string | Uint8Array) => void socket.emit('orpc', msg),
      close: () => socket.disconnect(true),
    };

    socket.on('orpc', (payload: string | ArrayBuffer | Uint8Array) => {
      const message = {
        rawData: payload,
        uint8Array: () => toUint8Array(payload),
      };
      streamingHandler.message(peer, message, { context: {} });
    });
  
    // socket.on('orpc', msg => streamingHandler.message(peer, msg, { context: {} }));
    socket.on('disconnect', () => streamingHandler.close(peer));
  });
  
//   // Handle Socket.IO connections with oRPC bridge
//   io.on('connection', (socket) => {
//     console.log('Socket.IO client connected:', socket.id);
//     
//     // Create peer adapter that turns Socket.IO socket ⟷ oRPC peer
//     const peer = {
//       send: (msg: string | Uint8Array) => socket.emit('orpc', msg),
//       close: () => socket.disconnect(true),
//     };
//     
//     // Handle oRPC messages via Socket.IO
//     socket.on('orpc', (msg: string | ArrayBuffer) => {
//       streamingHandler.message(peer, msg, { context: {} });
//     });
//     
//     socket.on('disconnect', () => {
//       console.log('Socket.IO client disconnected:', socket.id);
//       streamingHandler.close(peer);
//     });
//     
//     socket.on('error', (error) => {
//       console.error('Socket.IO error:', error);
//     });
//   });

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Socket.IO server ready for streaming at ws://localhost:${port}/socket.io`);
  });
}

export default app;
