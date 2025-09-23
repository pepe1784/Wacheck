import { type User, type InsertUser, type GameProfile, type InsertGameProfile, type GameActivity, type InsertGameActivity, type DailyChallenge, type InsertDailyChallenge } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGameProfile(userId: string): Promise<GameProfile | undefined>;
  createGameProfile(profile: InsertGameProfile): Promise<GameProfile>;
  updateGameProfile(profileId: string, updates: Partial<GameProfile>): Promise<GameProfile>;
  
  getGameActivities(profileId: string): Promise<GameActivity[]>;
  createGameActivity(activity: InsertGameActivity): Promise<GameActivity>;
  
  getDailyChallenge(profileId: string, date: string): Promise<DailyChallenge | undefined>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  updateDailyChallenge(challengeId: string, updates: Partial<DailyChallenge>): Promise<DailyChallenge>;
  
  getLeaderboard(): Promise<GameProfile[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private gameProfiles: Map<string, GameProfile>;
  private gameActivities: Map<string, GameActivity>;
  private dailyChallenges: Map<string, DailyChallenge>;

  constructor() {
    this.users = new Map();
    this.gameProfiles = new Map();
    this.gameActivities = new Map();
    this.dailyChallenges = new Map();
    
    // Create default demo profile
    this.initializeDemo();
  }

  private initializeDemo() {
    const demoUserId = "demo-user-1";
    const demoUser: User = {
      id: demoUserId,
      username: "EcoWarrior",
      password: "demo"
    };
    this.users.set(demoUserId, demoUser);

    const demoProfileId = "demo-profile-1";
    const demoProfile: GameProfile = {
      id: demoProfileId,
      userId: demoUserId,
      points: 1250,
      level: 3,
      totalWaterSaved: 2840,
      dailyStreak: 7,
      achievements: ["eco_warrior", "green_guardian", "repair_expert"],
      lastPlayDate: new Date(),
      createdAt: new Date()
    };
    this.gameProfiles.set(demoProfileId, demoProfile);

    // Create demo daily challenge
    const demoChallengeId = "demo-challenge-1";
    const demoChallenge: DailyChallenge = {
      id: demoChallengeId,
      profileId: demoProfileId,
      challengeType: "daily_water_saving",
      targetAmount: 50,
      currentProgress: 32,
      isCompleted: false,
      date: new Date()
    };
    this.dailyChallenges.set(demoChallengeId, demoChallenge);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getGameProfile(userId: string): Promise<GameProfile | undefined> {
    return Array.from(this.gameProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createGameProfile(insertProfile: InsertGameProfile): Promise<GameProfile> {
    const id = randomUUID();
    const profile: GameProfile = {
      userId: null,
      points: 0,
      level: 1,
      totalWaterSaved: 0,
      dailyStreak: 0,
      achievements: [],
      lastPlayDate: null,
      ...insertProfile,
      id,
      createdAt: new Date()
    };
    this.gameProfiles.set(id, profile);
    return profile;
  }

  async updateGameProfile(profileId: string, updates: Partial<GameProfile>): Promise<GameProfile> {
    const existing = this.gameProfiles.get(profileId);
    if (!existing) {
      throw new Error("Profile not found");
    }
    const updated = { ...existing, ...updates };
    this.gameProfiles.set(profileId, updated);
    return updated;
  }

  async getGameActivities(profileId: string): Promise<GameActivity[]> {
    return Array.from(this.gameActivities.values()).filter(
      (activity) => activity.profileId === profileId
    );
  }

  async createGameActivity(insertActivity: InsertGameActivity): Promise<GameActivity> {
    const id = randomUUID();
    const activity: GameActivity = {
      profileId: null,
      ...insertActivity,
      id,
      completedAt: new Date()
    };
    this.gameActivities.set(id, activity);
    return activity;
  }

  async getDailyChallenge(profileId: string, date: string): Promise<DailyChallenge | undefined> {
    return Array.from(this.dailyChallenges.values()).find(
      (challenge) => challenge.profileId === profileId && 
      challenge.date.toDateString() === new Date(date).toDateString()
    );
  }

  async createDailyChallenge(insertChallenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const id = randomUUID();
    const challenge: DailyChallenge = {
      profileId: null,
      currentProgress: 0,
      isCompleted: false,
      ...insertChallenge,
      id,
      date: new Date()
    };
    this.dailyChallenges.set(id, challenge);
    return challenge;
  }

  async updateDailyChallenge(challengeId: string, updates: Partial<DailyChallenge>): Promise<DailyChallenge> {
    const existing = this.dailyChallenges.get(challengeId);
    if (!existing) {
      throw new Error("Challenge not found");
    }
    const updated = { ...existing, ...updates };
    this.dailyChallenges.set(challengeId, updated);
    return updated;
  }

  async getLeaderboard(): Promise<GameProfile[]> {
    return Array.from(this.gameProfiles.values())
      .sort((a, b) => b.totalWaterSaved - a.totalWaterSaved)
      .slice(0, 10);
  }
}

export const storage = new MemStorage();
