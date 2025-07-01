import { chats, messages, type Chat, type Message, type InsertChat, type InsertMessage } from "@shared/schema";

export interface IStorage {
  // Chat operations
  createChat(chat: InsertChat): Promise<Chat>;
  getChat(id: number): Promise<Chat | undefined>;
  getChatsByUserId(userId?: string): Promise<Chat[]>;
  updateChat(id: number, updates: Partial<InsertChat>): Promise<Chat | undefined>;
  deleteChat(id: number): Promise<boolean>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChatId(chatId: number): Promise<Message[]>;
  getMessageById(id: number): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private currentChatId: number;
  private currentMessageId: number;

  constructor() {
    this.chats = new Map();
    this.messages = new Map();
    this.currentChatId = 1;
    this.currentMessageId = 1;
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.currentChatId++;
    const now = new Date();
    const chat: Chat = { 
      ...insertChat, 
      id, 
      createdAt: now,
      updatedAt: now,
      currentTopic: insertChat.currentTopic || null
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getChatsByUserId(userId?: string): Promise<Chat[]> {
    return Array.from(this.chats.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async updateChat(id: number, updates: Partial<InsertChat>): Promise<Chat | undefined> {
    const chat = this.chats.get(id);
    if (!chat) return undefined;
    
    const updatedChat: Chat = { 
      ...chat, 
      ...updates, 
      updatedAt: new Date(),
      currentTopic: updates.currentTopic !== undefined ? updates.currentTopic : chat.currentTopic
    };
    this.chats.set(id, updatedChat);
    return updatedChat;
  }

  async deleteChat(id: number): Promise<boolean> {
    // Also delete all messages in this chat
    const chatMessages = Array.from(this.messages.values()).filter(m => m.chatId === id);
    chatMessages.forEach(m => this.messages.delete(m.id));
    
    return this.chats.delete(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      metadata: insertMessage.metadata || null
    };
    this.messages.set(id, message);
    
    // Update chat's updatedAt timestamp
    const chat = this.chats.get(insertMessage.chatId);
    if (chat) {
      this.chats.set(chat.id, { ...chat, updatedAt: new Date() });
    }
    
    return message;
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }
}

export const storage = new MemStorage();
