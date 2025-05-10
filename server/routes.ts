import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  fetchCurrentWeather, 
  fetchForecast, 
  fetchWeatherAlerts,
  searchLocation
} from "./weather";
import { insertSavedLocationSchema, insertWeatherAlertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Weather API routes
  app.get("/api/weather", async (req, res, next) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const weather = await fetchCurrentWeather(lat as string, lon as string, units as string);
      res.json(weather);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/forecast", async (req, res, next) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const forecast = await fetchForecast(lat as string, lon as string, units as string);
      res.json(forecast);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/weather/alerts", async (req, res, next) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const alerts = await fetchWeatherAlerts(lat as string, lon as string);
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/location/search", async (req, res, next) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await searchLocation(q as string);
      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  // Saved locations API routes (protected)
  app.get("/api/locations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const locations = await storage.getSavedLocationsByUserId(req.user.id);
    res.json(locations);
  });

  app.post("/api/locations", async (req, res, next) => {
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

  app.delete("/api/locations/:id", async (req, res, next) => {
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

  // Weather alerts API routes (protected)
  app.get("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const alerts = await storage.getWeatherAlertsByUserId(req.user.id);
    res.json(alerts);
  });

  app.post("/api/alerts", async (req, res, next) => {
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
      
      // Verify location belongs to user
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

  app.patch("/api/alerts/:id", async (req, res, next) => {
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

  app.delete("/api/alerts/:id", async (req, res, next) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
