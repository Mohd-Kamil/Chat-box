import { type Chat, type Message } from "@shared/schema";

const CHATS_STORAGE_KEY = 'shawngpt_chats';
const MESSAGES_STORAGE_KEY = 'shawngpt_messages';

export function saveChatsToStorage(chats: Chat[]): void {
  try {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Failed to save chats to localStorage:', error);
  }
}

export function loadChatsFromStorage(): Chat[] {
  try {
    const stored = localStorage.getItem(CHATS_STORAGE_KEY);
    if (!stored) return [];
    
    const chats = JSON.parse(stored);
    // Convert date strings back to Date objects
    return chats.map((chat: any) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to load chats from localStorage:', error);
    return [];
  }
}

export function saveMessagesToStorage(chatId: number, messages: Message[]): void {
  try {
    const allMessages = loadAllMessagesFromStorage();
    allMessages[chatId] = messages;
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
}

export function loadMessagesFromStorage(chatId: number): Message[] {
  try {
    const allMessages = loadAllMessagesFromStorage();
    const messages = allMessages[chatId] || [];
    
    // Convert date strings back to Date objects
    return messages.map((message: any) => ({
      ...message,
      createdAt: new Date(message.createdAt),
    }));
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
    return [];
  }
}

function loadAllMessagesFromStorage(): Record<number, Message[]> {
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load all messages from localStorage:', error);
    return {};
  }
}

export function clearAllStorage(): void {
  try {
    localStorage.removeItem(CHATS_STORAGE_KEY);
    localStorage.removeItem(MESSAGES_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

export function exportChatsData(): string {
  try {
    const chats = loadChatsFromStorage();
    const allMessages = loadAllMessagesFromStorage();
    
    const exportData = {
      chats,
      messages: allMessages,
      exportedAt: new Date().toISOString(),
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export chats data:', error);
    return '';
  }
}

export function importChatsData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.chats && Array.isArray(data.chats)) {
      saveChatsToStorage(data.chats);
    }
    
    if (data.messages && typeof data.messages === 'object') {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(data.messages));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to import chats data:', error);
    return false;
  }
}
