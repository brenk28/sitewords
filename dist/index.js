// server/app.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  sightWords;
  currentId;
  constructor() {
    this.sightWords = /* @__PURE__ */ new Map();
    this.currentId = 1;
  }
  async getSightWords(userId) {
    return this.sightWords.get(userId);
  }
  async createSightWords(data) {
    const id = this.currentId++;
    const record = {
      id,
      words: data.words,
      randomOrder: data.randomOrder ?? false,
      autoAdvance: data.autoAdvance ?? false,
      speechEnabled: data.speechEnabled ?? true,
      speechRate: data.speechRate ?? "0.8",
      speechPitch: data.speechPitch ?? "1.0",
      speechVoice: data.speechVoice ?? null,
      userId: data.userId ?? "default"
    };
    this.sightWords.set(record.userId, record);
    return record;
  }
  async updateSightWords(userId, data) {
    const existing = this.sightWords.get(userId);
    if (!existing) {
      return void 0;
    }
    const updated = {
      ...existing,
      ...data
    };
    this.sightWords.set(userId, updated);
    return updated;
  }
};
var defaultWords = [
  "I",
  "the",
  "am",
  "like",
  "to",
  "a",
  "have",
  "he",
  "is",
  "we",
  "my",
  "make",
  "for",
  "me",
  "with",
  "are",
  "that",
  "of",
  "they",
  "you",
  "do",
  "one",
  "two",
  "three",
  "four",
  "five",
  "here",
  "go",
  "from",
  "yellow",
  "what",
  "when",
  "why",
  "who",
  "come",
  "play",
  "any",
  "down",
  "her",
  "how",
  "away",
  "give",
  "little",
  "funny",
  "were",
  "some",
  "find",
  "again",
  "over",
  "all",
  "now",
  "pretty",
  "brown",
  "black",
  "white",
  "good",
  "open",
  "could",
  "please",
  "want",
  "every",
  "be",
  "saw",
  "our",
  "eat",
  "soon",
  "walk",
  "into",
  "there"
];
var storage = new MemStorage();
storage.createSightWords({
  userId: "default",
  words: defaultWords,
  randomOrder: false,
  autoAdvance: false,
  speechEnabled: true,
  speechRate: "0.8",
  speechPitch: "1.0",
  speechVoice: void 0
});

// shared/schema.ts
import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sightWords = pgTable("sight_words", {
  id: serial("id").primaryKey(),
  words: text("words").array().notNull(),
  randomOrder: boolean("random_order").notNull().default(false),
  autoAdvance: boolean("auto_advance").notNull().default(false),
  speechEnabled: boolean("speech_enabled").notNull().default(true),
  speechRate: text("speech_rate").notNull().default("0.8"),
  speechPitch: text("speech_pitch").notNull().default("1.0"),
  speechVoice: text("speech_voice"),
  userId: text("user_id").notNull().default("default")
});
var insertSightWordsSchema = createInsertSchema(sightWords).omit({
  id: true
});
var updateSightWordsSchema = z.object({
  words: z.array(z.string()),
  randomOrder: z.boolean(),
  autoAdvance: z.boolean(),
  speechEnabled: z.boolean(),
  speechRate: z.string(),
  speechPitch: z.string(),
  speechVoice: z.string().optional()
});

// server/routes.ts
async function registerRoutes(app) {
  app.get("/api/sight-words", async (req, res) => {
    try {
      const userId = "default";
      const sightWords2 = await storage.getSightWords(userId);
      if (!sightWords2) {
        return res.status(404).json({ message: "Sight words configuration not found" });
      }
      return res.json(sightWords2);
    } catch (error) {
      console.error("Error fetching sight words:", error);
      return res.status(500).json({ message: "Failed to fetch sight words" });
    }
  });
  app.post("/api/sight-words", async (req, res) => {
    try {
      const userId = "default";
      const result = updateSightWordsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid data provided",
          errors: result.error.format()
        });
      }
      const existing = await storage.getSightWords(userId);
      if (existing) {
        const updated = await storage.updateSightWords(userId, result.data);
        return res.json(updated);
      } else {
        const created = await storage.createSightWords({
          userId,
          ...result.data
        });
        return res.status(201).json(created);
      }
    } catch (error) {
      console.error("Error updating sight words:", error);
      return res.status(500).json({ message: "Failed to update sight words" });
    }
  });
  const httpServer = createServer(app);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/app.ts
async function createApp() {
  const app = express2();
  app.use(express2.json());
  app.use(express2.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    const start = Date.now();
    const path3 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path3.startsWith("/api")) {
        let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "\u2026";
        }
        log(logLine);
      }
    });
    next();
  });
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  return { app, server };
}

// server/index.ts
(async () => {
  const { app, server } = await createApp();
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
