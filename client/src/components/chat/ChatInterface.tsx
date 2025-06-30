import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import MessageCard from "./MessageCard";
import InputArea from "./InputArea";
import InfoPanel from "./InfoPanel";
import { Button } from "@/components/ui/button";
import { Menu, X, Plus, Bot, Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  initialChatId?: number;
}

export default function ChatInterface({ initialChatId }: ChatInterfaceProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

  const handleSendMessage = async (content: string) => {
    if (!currentChatId) {
      const newChat = await createNewChat();
      if (newChat) {
        setCurrentChatId(newChat.id);
        await sendMessage(content, newChat.id, selectedMode);
      }
    } else {
      await sendMessage(content, currentChatId, selectedMode);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="w-80 h-full bg-slate-900/90 backdrop-blur-xl border-r border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
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
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-4">
              <Button 
                onClick={handleNewChat}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900/90 backdrop-blur-xl border-b border-slate-700 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-white"
            >
              <Home className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-semibold text-white">ShawnGPT</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            className="text-gray-400 hover:text-white"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Button
                    variant="ghost"
                    onClick={() => setLocation('/')}
                    className="text-gray-400 hover:text-white mr-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Bot className="text-white w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Ready to Chat!</h2>
                <p className="text-gray-400 text-lg">What's on your mind, yaar? Let's talk!</p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">Movies & TV</span>
                  <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm">Games</span>
                  <span className="px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full text-sm">Web Search</span>
                  <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">Hinglish Support</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    isLatest={messages[messages.length - 1]?.id === message.id}
                  />
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-4xl">
                      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl rounded-tl-sm p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="text-white w-4 h-4" />
                          </div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          </div>
                          <span className="text-gray-400 text-sm">ShawnGPT is thinking...</span>
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
        <InputArea
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          selectedMode={selectedMode}
        />
      </div>

      {/* Right Info Panel (Desktop only) */}
      <div className="hidden xl:flex w-80 flex-shrink-0">
        <InfoPanel selectedMode={selectedMode} onModeChange={setSelectedMode} />
      </div>
    </div>
  );
}
