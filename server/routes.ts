import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameActivitySchema, insertDailyChallengeSchema } from "@shared/schema";

// Simple session-based user system
function getOrCreateUser(req: any) {
  if (!req.session.userId) {
    req.session.userId = Math.random().toString(36).substring(2, 15);
    req.session.username = `Usuario${Math.floor(Math.random() * 10000)}`;
  }
  return { userId: req.session.userId, username: req.session.username };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user game profile
  app.get("/api/profile", async (req, res) => {
    try {
      const { userId, username } = getOrCreateUser(req);
      let profile = await storage.getGameProfile(userId);
      
      if (!profile) {
        // Create new profile for user
        profile = await storage.createGameProfile({
          userId,
          points: 0,
          level: 1,
          totalWaterSaved: 0,
          dailyStreak: 0,
          achievements: [],
          lastPlayDate: null
        });
      }
      
      res.json({ ...profile, username });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  // Update game profile
  app.patch("/api/profile/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const profile = await storage.updateGameProfile(id, updates);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get daily challenge
  app.get("/api/daily-challenge", async (req, res) => {
    try {
      const { userId } = getOrCreateUser(req);
      let profile = await storage.getGameProfile(userId);
      
      if (!profile) {
        profile = await storage.createGameProfile({
          userId,
          points: 0,
          level: 1,
          totalWaterSaved: 0,
          dailyStreak: 0,
          achievements: [],
          lastPlayDate: null
        });
      }
      
      const today = new Date().toDateString();
      let challenge = await storage.getDailyChallenge(profile.id, today);
      
      if (!challenge) {
        challenge = await storage.createDailyChallenge({
          profileId: profile.id,
          challengeType: "daily_water_saving",
          targetAmount: 50,
          currentProgress: 0,
          isCompleted: false
        });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error('Daily challenge error:', error);
      res.status(500).json({ message: "Failed to get daily challenge" });
    }
  });

  // Complete game activity
  app.post("/api/activities", async (req, res) => {
    try {
      const { userId } = getOrCreateUser(req);
      let profile = await storage.getGameProfile(userId);
      
      if (!profile) {
        profile = await storage.createGameProfile({
          userId,
          points: 0,
          level: 1,
          totalWaterSaved: 0,
          dailyStreak: 0,
          achievements: [],
          lastPlayDate: null
        });
      }
      
      const activityData = insertGameActivitySchema.parse(req.body);
      const activity = await storage.createGameActivity({
        ...activityData,
        profileId: profile.id
      });
      
      // Update profile points and water saved
      const updatedProfile = await storage.updateGameProfile(profile.id, {
        points: profile.points + activityData.pointsEarned,
        totalWaterSaved: profile.totalWaterSaved + activityData.waterSaved,
        lastPlayDate: new Date()
      });
      
      // Update daily challenge progress
      const today = new Date().toDateString();
      let challenge = await storage.getDailyChallenge(profile.id, today);
      if (!challenge) {
        challenge = await storage.createDailyChallenge({
          profileId: profile.id,
          challengeType: "daily_water_saving",
          targetAmount: 50,
          currentProgress: 0,
          isCompleted: false
        });
      }
      
      const newProgress = challenge.currentProgress + activityData.waterSaved;
      await storage.updateDailyChallenge(challenge.id, {
        currentProgress: newProgress,
        isCompleted: newProgress >= challenge.targetAmount
      });
      
      res.json(activity);
    } catch (error) {
      console.error('Activity error:', error);
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  // Get educational tips
  app.get("/api/tips", async (req, res) => {
    const tips = [
      {
        id: 1,
        content: "Una ducha de 4 minutos usa aproximadamente 40 litros de agua. ¡Cada minuto menos son 10 litros ahorrados!",
        category: "Uso doméstico"
      },
      {
        id: 2,
        content: "Cerrar el grifo mientras te lavas los dientes puede ahorrar hasta 8 litros de agua cada vez.",
        category: "Higiene personal"
      },
      {
        id: 3,
        content: "Una fuga pequeña puede desperdiciar más de 200 litros de agua al día. ¡Repárala inmediatamente!",
        category: "Mantenimiento"
      },
      {
        id: 4,
        content: "Recolectar agua de lluvia para regar plantas puede ahorrar hasta 100 litros por sesión de riego.",
        category: "Jardín"
      }
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    res.json(randomTip);
  });

  const httpServer = createServer(app);
  return httpServer;
}
