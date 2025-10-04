import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { updateSightWordsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  // Get sight words for a user
  app.get('/api/sight-words', async (req: Request, res: Response) => {
    try {
      const userId = "default"; // For now, just use a default user
      
      const sightWords = await storage.getSightWords(userId);
      
      if (!sightWords) {
        return res.status(404).json({ message: "Sight words configuration not found" });
      }
      
      return res.json(sightWords);
    } catch (error) {
      console.error("Error fetching sight words:", error);
      return res.status(500).json({ message: "Failed to fetch sight words" });
    }
  });

  // Update sight words for a user
  app.post('/api/sight-words', async (req: Request, res: Response) => {
    try {
      const userId = "default"; // For now, just use a default user
      
      // Validate request body
      const result = updateSightWordsSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid data provided", 
          errors: result.error.format() 
        });
      }
      
      // Check if sight words exist for this user
      const existing = await storage.getSightWords(userId);
      
      if (existing) {
        // Update existing
        const updated = await storage.updateSightWords(userId, result.data);
        return res.json(updated);
      } else {
        // Create new
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
