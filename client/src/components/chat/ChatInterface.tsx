import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import MessageCard from "./MessageCard";
import InputArea from "./InputArea";
import InfoPanel from "./InfoPanel";
import { Button } from "@/components/ui/button";
import { Menu, X, Plus, Bot, Home, ArrowLeft, Settings, Film, Search, Zap, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatInterfaceProps {
  initialChatId?: number;
}

export default function ChatInterface({ initialChatId }: ChatInterfaceProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileInfoPanelOpen, setIsMobileInfoPanelOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | undefined>(initialChatId);
  const [selectedMode, setSelectedMode] = useState<string>('chat');
  const [, setLocation] = useLocation();
  
  const {
    messages,
    chats,
    isLoading,
    sendMessage,
    createNewChat,
    switchToChat,
    deleteChat,
  } = useChat(currentChatId);

  const isMobile = useIsMobile();

  // Local state for optimistic UI
  const [displayedMessages, setDisplayedMessages] = useState(messages);
  const [localIsLoading, setLocalIsLoading] = useState(false);

  // Handle query parameter from landing page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query && !currentChatId) {
      handleSendMessage(query);
    }
  }, []);

  const handleNewChat = async () => {
    const newChat = await createNewChat();
    if (newChat) {
      setCurrentChatId(newChat.id);
      setIsMobileSidebarOpen(false);
    }
  };

  const handleSwitchChat = (chatId: number) => {
    setCurrentChatId(chatId);
    switchToChat(chatId);
    setIsMobileSidebarOpen(false);
  };

  // Mode options
  const modeOptions = [
    { key: 'auto', label: 'Auto', icon: <Bot className="w-4 h-4" /> },
    { key: 'cinephile', label: 'Cinephile', icon: <Film className="w-4 h-4" /> },
    { key: 'research', label: 'Research', icon: <Search className="w-4 h-4" /> },
    { key: 'chat', label: 'Chat', icon: <Languages className="w-4 h-4" /> },
    { key: 'game', label: 'Games', icon: <Zap className="w-4 h-4" /> },
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    const tempId = Date.now();
    const newUserMsg = {
      id: tempId,
      content,
      role: 'user',
      createdAt: new Date(),
      chatId: currentChatId || 0,
      metadata: {},
    };
    setDisplayedMessages([...displayedMessages, newUserMsg]);
    setLocalIsLoading(true);
    try {
      if (!currentChatId) {
        const newChat = await createNewChat();
        if (newChat) {
          setCurrentChatId(newChat.id);
          await sendMessage(content, newChat.id, selectedMode === 'auto' ? undefined : selectedMode);
        }
      } else {
        await sendMessage(content, currentChatId, selectedMode === 'auto' ? undefined : selectedMode);
      }
    } catch (err) {
      // Optionally show a toast or error message here
    } finally {
      setLocalIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-48 h-48 sm:w-64 sm:h-64 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-48 h-48 sm:w-64 sm:h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 flex-shrink-0 relative z-10">
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSwitchChat={handleSwitchChat}
          onDeleteChat={deleteChat}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex">
          <div className="w-72 max-w-full h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 flex flex-col">
            <div className="p-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="text-white w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-white">ShawnGPT</h1>
                  <p className="text-xs text-gray-400">AI Buddy</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-3">
              <Button 
                onClick={handleNewChat}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>

            <Sidebar
              chats={chats}
              currentChatId={currentChatId}
              onNewChat={handleNewChat}
              onSwitchChat={handleSwitchChat}
              onDeleteChat={deleteChat}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Mobile Info Panel Overlay */}
      {isMobileInfoPanelOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex">
          <div className="w-full max-w-full h-full bg-slate-900/95 backdrop-blur-xl flex flex-col">
            <div className="p-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Settings & Info</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileInfoPanelOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <InfoPanel 
                selectedMode={selectedMode} 
                onModeChange={setSelectedMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 p-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-white"
            >
              <Home className="w-4 h-4" />
            </Button>
            <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="text-white w-4 h-4" />
            </div>
            <span className="text-base font-semibold text-white">ShawnGPT</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileInfoPanelOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="text-gray-400 hover:text-white"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Single Mobile Mode Selector (all 5 modes, above input area) */}
        {!isMobileInfoPanelOpen && (
          <div className="lg:hidden bg-slate-800/70 backdrop-blur-sm border-b border-slate-700 p-2">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {[
                { key: 'auto', label: 'Auto', icon: '🤖' },
                { key: 'chat', label: 'Chat', icon: '💬' },
                { key: 'cinephile', label: 'Cinephile', icon: '🎬' },
                { key: 'research', label: 'Research', icon: '🔍' },
                { key: 'game', label: 'Game', icon: '🎮' },
              ].map((mode) => (
                <button
                  key={mode.key}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 whitespace-nowrap transition-colors",
                    selectedMode === mode.key 
                      ? "bg-blue-600 text-white" 
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  )}
                  onClick={() => setSelectedMode(mode.key)}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode Selector (styled button group) */}
        <div className="w-full bg-slate-800/70 border-b border-slate-700 px-2 py-2 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-400 mr-2">Mode:</span>
          <div className="flex gap-1">
            {modeOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSelectedMode(opt.key)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                  selectedMode === opt.key
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-slate-900 text-gray-300 border-slate-700 hover:bg-blue-700 hover:text-white"
                )}
                style={{ minWidth: 80 }}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-2 py-4 lg:py-8">
            {displayedMessages.length === 0 ? (
              <div className="text-center mb-6 lg:mb-12">
                <div className="flex items-center justify-center mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => setLocation('/')}
                    className="text-gray-400 hover:text-white mr-2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Home
                  </Button>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Bot className="text-white w-6 h-6" />
                </div>
                <h2 className="text-xl lg:text-3xl font-bold text-white mb-1">Ready to Chat!</h2>
                <p className="text-gray-400 text-sm lg:text-lg mb-2">What's on your mind, yaar? Let's talk!</p>
                <div className="flex flex-wrap justify-center gap-1 mt-4">
                  <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded-full text-xs">Movies & TV</span>
                  <span className="px-2 py-0.5 bg-emerald-600/20 text-emerald-400 rounded-full text-xs">Games</span>
                  <span className="px-2 py-0.5 bg-orange-600/20 text-orange-400 rounded-full text-xs">Web Search</span>
                  <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded-full text-xs">Hinglish Support</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 lg:space-y-6">
                {displayedMessages.map((msg, i) => (
                  <MessageCard key={msg.id} message={msg} isLatest={i === displayedMessages.length - 1} />
                ))}
                {localIsLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-xl">
                      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl rounded-tl-sm p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="text-white w-4 h-4" />
                          </div>
                          <span className="text-gray-400 text-xs animate-pulse">Bot is typing…</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700 bg-slate-900/70 backdrop-blur-sm">
          <InputArea
            onSendMessage={handleSendMessage}
            disabled={localIsLoading}
            selectedMode={selectedMode}
          />
        </div>
      </div>

      {/* Desktop Info Panel */}
      <div className="hidden lg:flex w-80 flex-shrink-0 relative z-10">
        <InfoPanel 
          selectedMode={selectedMode} 
          onModeChange={setSelectedMode}
        />
      </div>
    </div>
  );
}
