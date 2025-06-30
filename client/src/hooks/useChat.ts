import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Chat, type Message, type ChatResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { saveChatsToStorage, loadChatsFromStorage } from "@/lib/storage";

export function useChat(initialChatId?: number) {
  const [currentChatId, setCurrentChatId] = useState<number | undefined>(initialChatId);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load chats
  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['/api/chats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/chats');
        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }
        const data = await response.json();
        return data as Chat[];
      } catch (error) {
        // Fallback to local storage
        return loadChatsFromStorage();
      }
    },
  });

  // Load messages for current chat
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chats', currentChatId, 'messages'],
    queryFn: async () => {
      if (!currentChatId) return [];
      
      try {
        const response = await fetch(`/api/chats/${currentChatId}/messages`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        return await response.json() as Message[];
      } catch (error) {
        return [];
      }
    },
    enabled: !!currentChatId,
  });

  // Create new chat mutation
  const createChatMutation = useMutation({
    mutationFn: async (title: string = "New Chat") => {
      try {
        const response = await apiRequest('POST', '/api/chats', { title });
        return await response.json() as Chat;
      } catch (error) {
        // Fallback to local storage
        const newChat: Chat = {
          id: Date.now(),
          title,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const updatedChats = [newChat, ...chats];
        saveChatsToStorage(updatedChats);
        return newChat;
      }
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      setCurrentChatId(newChat.id);
    },
    onError: () => {
      toast({
        title: "Failed to create chat",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, chatId }: { content: string; chatId: number }) => {
      try {
        const response = await apiRequest('POST', `/api/chats/${chatId}/messages`, {
          content,
          role: 'user',
        });
        return await response.json() as ChatResponse;
      } catch (error) {
        throw new Error('Failed to send message');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats', currentChatId, 'messages'] });
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    },
  });

  // Delete chat mutation
  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: number) => {
      try {
        await apiRequest('DELETE', `/api/chats/${chatId}`);
        return chatId;
      } catch (error) {
        // Fallback to local storage
        const updatedChats = chats.filter(chat => chat.id !== chatId);
        saveChatsToStorage(updatedChats);
        return chatId;
      }
    },
    onSuccess: (deletedChatId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      if (currentChatId === deletedChatId) {
        setCurrentChatId(undefined);
      }
      toast({
        title: "Chat deleted",
        description: "The chat has been removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete chat",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const createNewChat = async (title?: string) => {
    try {
      const newChat = await createChatMutation.mutateAsync(title || "New Chat");
      return newChat;
    } catch (error) {
      return null;
    }
  };

  const sendMessage = async (content: string, chatId?: number) => {
    const targetChatId = chatId || currentChatId;
    if (!targetChatId) {
      throw new Error('No chat selected');
    }

    return sendMessageMutation.mutateAsync({ content, chatId: targetChatId });
  };

  const switchToChat = (chatId: number) => {
    setCurrentChatId(chatId);
  };

  const deleteChat = (chatId: number) => {
    deleteChatMutation.mutate(chatId);
  };

  return {
    // Data
    chats,
    messages,
    currentChatId,
    
    // Loading states
    isLoading: sendMessageMutation.isPending,
    chatsLoading,
    messagesLoading,
    
    // Actions
    createNewChat,
    sendMessage,
    switchToChat,
    deleteChat,
  };
}
