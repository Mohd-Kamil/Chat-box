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
        <div className="p-4 lg:p-6 border-b border-slate-700">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="text-white w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div>
              <h1 className="text-base lg:text-xl font-semibold text-white">ShawnGPT</h1>
              <p className="text-xs lg:text-sm text-gray-400">AI Buddy</p>
            </div>
          </div>
          <Button 
            onClick={onNewChat}
            className="w-full mt-3 lg:mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm lg:text-base py-2 lg:py-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      )}
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2 lg:p-4">
        <h3 className="text-xs lg:text-sm font-medium text-gray-400 mb-2 lg:mb-3">Recent Chats</h3>
        <div className="space-y-1 lg:space-y-2">
          {chats.length === 0 ? (
            <div className="text-center py-6 lg:py-8 text-gray-500">
              <MessageSquare className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-1 lg:mb-2 opacity-50" />
              <p className="text-xs lg:text-sm">No chats yet</p>
              <p className="text-xs">Start a conversation!</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.id}
                className={cn(
                  "p-2 lg:p-3 rounded-lg cursor-pointer group transition-colors relative",
                  currentChatId === chat.id 
                    ? "bg-blue-600/20 border border-blue-600/30" 
                    : "hover:bg-slate-800"
                )}
              >
                <div 
                  className="flex items-start space-x-2 lg:space-x-3"
                  onClick={() => onSwitchChat(chat.id)}
                >
                  <MessageSquare className="text-gray-500 w-4 h-4 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm text-white truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 lg:mt-1">
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
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Settings Footer */}
      <div className="p-2 lg:p-4 border-t border-slate-700">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="w-7 h-7 lg:w-8 lg:h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <User className="text-gray-300 w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs lg:text-sm text-white">Guest User</p>
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
