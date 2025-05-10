var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertSavedLocationSchema: () => insertSavedLocationSchema,
  insertUserSchema: () => insertUserSchema,
  insertWeatherAlertSchema: () => insertWeatherAlertSchema,
  savedLocations: () => savedLocations,
  users: () => users,
  weatherAlerts: () => weatherAlerts
});
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var savedLocations = pgTable("saved_locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  lat: text("lat").notNull(),
  lon: text("lon").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertSavedLocationSchema = createInsertSchema(savedLocations).omit({
  id: true,
  createdAt: true
});
var weatherAlerts = pgTable("weather_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  locationId: integer("location_id").notNull().references(() => savedLocations.id),
  alertType: text("alert_type").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertWeatherAlertSchema = createInsertSchema(weatherAlerts).omit({
  id: true,
  createdAt: true
});

// server/storage.ts
import session from "express-session";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";

// server/db-local.ts
import * as pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var { Pool } = pg;
var dbUrl = process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/weatherapp";
var pool = new Pool({ connectionString: dbUrl });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  // Change the type here too
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  // Rest of the code remains the same...
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Saved locations operations
  async getSavedLocationsByUserId(userId) {
    return db.select().from(savedLocations).where(eq(savedLocations.userId, userId));
  }
  async getSavedLocationById(id) {
    const [location] = await db.select().from(savedLocations).where(eq(savedLocations.id, id));
    return location || void 0;
  }
  async createSavedLocation(insertLocation) {
    const [location] = await db.insert(savedLocations).values(insertLocation).returning();
    return location;
  }
  async deleteSavedLocation(id) {
    const result = await db.delete(savedLocations).where(eq(savedLocations.id, id)).returning({ id: savedLocations.id });
    return result.length > 0;
  }
  // Weather alerts operations
  async getWeatherAlertsByUserId(userId) {
    return db.select().from(weatherAlerts).where(eq(weatherAlerts.userId, userId));
  }
  async getWeatherAlertById(id) {
    const [alert] = await db.select().from(weatherAlerts).where(eq(weatherAlerts.id, id));
    return alert || void 0;
  }
  async createWeatherAlert(insertAlert) {
    const [alert] = await db.insert(weatherAlerts).values(insertAlert).returning();
    return alert;
  }
  async updateWeatherAlert(id, enabled) {
    const [alert] = await db.update(weatherAlerts).set({ enabled }).where(eq(weatherAlerts.id, id)).returning();
    return alert || void 0;
  }
  async deleteWeatherAlert(id) {
    const result = await db.delete(weatherAlerts).where(eq(weatherAlerts.id, id)).returning({ id: weatherAlerts.id });
    return result.length > 0;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSecret = process.env.SESSION_SECRET || "weatherapp-secret-key";
  const sessionSettings = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 1 week
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: validationResult.error.errors
        });
      }
      const { username, email, password } = validationResult.data;
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password: password2, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/weather.ts
var API_KEY = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY;
var BASE_URL = "https://api.openweathermap.org";
async function fetchCurrentWeather(lat, lon, units = "imperial") {
  if (!API_KEY) {
    throw new Error("OpenWeather API key is missing. Please add OPENWEATHER_API_KEY or VITE_OPENWEATHER_API_KEY to your environment variables.");
  }
  const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Weather API error: ${response.status} ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching current weather:", error);
    throw error;
  }
}
async function fetchForecast(lat, lon, units = "imperial") {
  if (!API_KEY) {
    throw new Error("OpenWeather API key is missing. Please add VITE_OPENWEATHER_API_KEY to your environment variables.");
  }
  const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Forecast API error: ${response.status} ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching forecast:", error);
    throw error;
  }
}
async function fetchWeatherAlerts(lat, lon) {
  if (!API_KEY) {
    throw new Error("OpenWeather API key is missing. Please add VITE_OPENWEATHER_API_KEY to your environment variables.");
  }
  const url = `${BASE_URL}/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401) {
        console.log("Weather alerts API requires a paid subscription - returning empty alerts array");
        return [];
      }
      const errorText = await response.text();
      console.warn(`Weather alerts API warning: ${response.status} ${errorText}`);
      return [];
    }
    const data = await response.json();
    return data.alerts || [];
  } catch (error) {
    console.warn("Weather alerts could not be fetched:", error);
    return [];
  }
}
async function searchLocation(query) {
  if (!API_KEY) {
    throw new Error("OpenWeather API key is missing. Please add VITE_OPENWEATHER_API_KEY to your environment variables.");
  }
  const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Geocoding API error: ${response.status} ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error searching location:", error);
    throw error;
  }
}

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/weather", async (req, res, next) => {
    try {
      const { lat, lon, units } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      const weather = await fetchCurrentWeather(lat, lon, units);
      res.json(weather);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/forecast", async (req, res, next) => {
    try {
      const { lat, lon, units } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      const forecast = await fetchForecast(lat, lon, units);
      res.json(forecast);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/weather/alerts", async (req, res, next) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      const alerts = await fetchWeatherAlerts(lat, lon);
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/location/search", async (req, res, next) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const results = await searchLocation(q);
      res.json(results);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/locations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const locations = await storage.getSavedLocationsByUserId(req.user.id);
    res.json(locations);
  });
  app2.post("/api/locations", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const validationResult = insertSavedLocationSchema.safeParse({
        ...req.body,
        userId: req.user.id
      });
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid location data",
          errors: validationResult.error.errors
        });
      }
      const location = await storage.createSavedLocation(validationResult.data);
      res.status(201).json(location);
    } catch (error) {
      next(error);
    }
  });
  app2.delete("/api/locations/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const idParam = z.coerce.number().safeParse(req.params.id);
      if (!idParam.success) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      const locationId = idParam.data;
      const location = await storage.getSavedLocationById(locationId);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      if (location.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this location" });
      }
      await storage.deleteSavedLocation(locationId);
      res.status(200).json({ message: "Location deleted successfully" });
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const alerts = await storage.getWeatherAlertsByUserId(req.user.id);
    res.json(alerts);
  });
  app2.post("/api/alerts", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const validationResult = insertWeatherAlertSchema.safeParse({
        ...req.body,
        userId: req.user.id
      });
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid alert data",
          errors: validationResult.error.errors
        });
      }
      const location = await storage.getSavedLocationById(validationResult.data.locationId);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      if (location.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to create alerts for this location" });
      }
      const alert = await storage.createWeatherAlert(validationResult.data);
      res.status(201).json(alert);
    } catch (error) {
      next(error);
    }
  });
  app2.patch("/api/alerts/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const idParam = z.coerce.number().safeParse(req.params.id);
      const enabledParam = z.boolean().safeParse(req.body.enabled);
      if (!idParam.success || !enabledParam.success) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      const alertId = idParam.data;
      const enabled = enabledParam.data;
      const alert = await storage.getWeatherAlertById(alertId);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      if (alert.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this alert" });
      }
      const updatedAlert = await storage.updateWeatherAlert(alertId, enabled);
      res.json(updatedAlert);
    } catch (error) {
      next(error);
    }
  });
  app2.delete("/api/alerts/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const idParam = z.coerce.number().safeParse(req.params.id);
      if (!idParam.success) {
        return res.status(400).json({ message: "Invalid alert ID" });
      }
      const alertId = idParam.data;
      const alert = await storage.getWeatherAlertById(alertId);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      if (alert.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this alert" });
      }
      await storage.deleteWeatherAlert(alertId);
      res.status(200).json({ message: "Alert deleted successfully" });
    } catch (error) {
      next(error);
    }
  });
  const httpServer = createServer(app2);
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
async function setupVite(app2, server) {
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
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
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
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
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
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
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
