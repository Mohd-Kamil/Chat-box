import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Debug environment variables
console.log("=== Environment Variables Debug ===");
console.log("PORT:", process.env.PORT);
console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
console.log("SERPER_API_KEY present:", !!process.env.SERPER_API_KEY);
console.log("TMDB_API_KEY present:", !!process.env.TMDB_API_KEY);
console.log("RAWG_API_KEY present:", !!process.env.RAWG_API_KEY);
console.log("DEEPSEEK_API_KEY present:", !!process.env.DEEPSEEK_API_KEY);
console.log("===================================");

// Debug API keys on startup
console.log('🔑 Checking API Keys:');
console.log('- TMDB:', process.env.TMDB_API_KEY ? '✅ Present' : '❌ Missing');
console.log('- RAWG:', process.env.RAWG_API_KEY ? '✅ Present' : '❌ Missing');
console.log('- Serper:', process.env.SERPER_API_KEY ? '✅ Present' : '❌ Missing');
console.log('- Gemini:', process.env.GEMINI_API_KEY ? '✅ Present' : '❌ Missing');
console.log('- DeepSeek:', process.env.DEEPSEEK_API_KEY ? '✅ Present' : '❌ Missing');

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
