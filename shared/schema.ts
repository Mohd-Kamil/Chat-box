import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => chats.id).notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  metadata: jsonb("metadata"), // For sources, API info, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chats.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// API Response types
export interface MovieRecommendation {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export interface GameRecommendation {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  released: string;
  platforms: Array<{ platform: { name: string } }>;
  genres: Array<{ name: string }>;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

export interface ChatResponse {
  content: string;
  sources?: SearchResult[];
  movies?: MovieRecommendation[];
  games?: GameRecommendation[];
  metadata?: Record<string, any>;
}
