import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sightWords = pgTable("sight_words", {
  id: serial("id").primaryKey(),
  words: text("words").array().notNull(),
  randomOrder: boolean("random_order").notNull().default(false),
  autoAdvance: boolean("auto_advance").notNull().default(false),
  speechEnabled: boolean("speech_enabled").notNull().default(true),
  speechRate: text("speech_rate").notNull().default("0.8"),
  speechPitch: text("speech_pitch").notNull().default("1.0"),
  speechVoice: text("speech_voice"),
  userId: text("user_id").notNull().default("default"),
});

export const insertSightWordsSchema = createInsertSchema(sightWords).omit({
  id: true,
});

export const updateSightWordsSchema = z.object({
  words: z.array(z.string()),
  randomOrder: z.boolean(),
  autoAdvance: z.boolean(),
  speechEnabled: z.boolean(),
  speechRate: z.string(),
  speechPitch: z.string(),
  speechVoice: z.string().optional(),
});

export type InsertSightWords = z.infer<typeof insertSightWordsSchema>;
export type UpdateSightWords = z.infer<typeof updateSightWordsSchema>;
export type SightWords = typeof sightWords.$inferSelect;
