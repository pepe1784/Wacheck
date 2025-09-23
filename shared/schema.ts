import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gameProfiles = pgTable("game_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  totalWaterSaved: integer("total_water_saved").notNull().default(0), // in liters
  dailyStreak: integer("daily_streak").notNull().default(0),
  achievements: text("achievements").array().notNull().default([]),
  lastPlayDate: timestamp("last_play_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const gameActivities = pgTable("game_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => gameProfiles.id),
  activityType: text("activity_type").notNull(), // 'water_simulator', 'leak_detection', 'rainwater_collection'
  pointsEarned: integer("points_earned").notNull(),
  waterSaved: integer("water_saved").notNull(), // in liters
  completedAt: timestamp("completed_at").notNull().default(sql`now()`),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => gameProfiles.id),
  challengeType: text("challenge_type").notNull(),
  targetAmount: integer("target_amount").notNull(), // liters to save
  currentProgress: integer("current_progress").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  date: timestamp("date").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameProfileSchema = createInsertSchema(gameProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertGameActivitySchema = createInsertSchema(gameActivities).omit({
  id: true,
  completedAt: true,
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
  date: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameProfile = typeof gameProfiles.$inferSelect;
export type InsertGameProfile = z.infer<typeof insertGameProfileSchema>;
export type GameActivity = typeof gameActivities.$inferSelect;
export type InsertGameActivity = z.infer<typeof insertGameActivitySchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
