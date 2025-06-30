import { type Chat } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Plus, Trash2, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: Chat[];
  currentChatId?: number;
  onNewChat: () => void;
  onSwitchChat: (chatId: number) => void;
  onDeleteChat: (chatId: number) => void;
  isMobile?: boolean;
}

export default function Sidebar({ 
  chats, 
  currentChatId, 
  onNewChat, 
  onSwitchChat, 
  onDeleteChat,
  isMobile = false 
}: SidebarProps) {
  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl border-r border-slate-700 flex flex-col h-full">
      {/* Sidebar Header */}
      {!isMobile && (
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">ShawnGPT</h1>
              <p className="text-sm text-gray-400">AI Buddy</p>
            </div>
          </div>
          
          <Button 
            onClick={onNewChat}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      )}
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Chats</h3>
        <div className="space-y-2">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a conversation!</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer group transition-colors relative",
                  currentChatId === chat.id 
                    ? "bg-blue-600/20 border border-blue-600/30" 
                    : "hover:bg-slate-800"
                )}
              >
                <div 
                  className="flex items-start space-x-3"
                  onClick={() => onSwitchChat(chat.id)}
                >
                  <MessageSquare className="text-gray-500 w-4 h-4 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Settings Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <User className="text-gray-300 w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white">Guest User</p>
            <p className="text-xs text-gray-500">Free Forever</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-400 hover:text-white w-6 h-6"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
