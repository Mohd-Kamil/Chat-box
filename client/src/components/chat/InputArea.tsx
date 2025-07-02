import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Film, Gamepad, Newspaper, Tv } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";

interface InputAreaProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  selectedMode?: string;
}

export default function InputArea({ onSendMessage, disabled }: InputAreaProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isListening, startListening, stopListening } = useVoiceInput({
    onResult: (transcript) => {
      setMessage(prev => prev + (prev ? ' ' : '') + transcript);
    }
  });

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  };

  const quickActions = [
    { label: "🎬 Trending Movies", query: "Recommend trending movies" },
    { label: "🎮 Popular Games", query: "Popular games 2024" },
    { label: "📰 Tech News", query: "Tech news today" },
    { label: "📺 Web Series", query: "Best web series" },
  ];

  const handleQuickAction = (query: string) => {
    setMessage(query);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="border-t border-slate-700 bg-slate-900/90 backdrop-blur-xl relative z-10">
      <div className="max-w-xl mx-auto px-2 py-3 lg:py-6">
        <div className="relative">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything, yaar... What's on your mind? 💬"
                className={cn(
                  "w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl px-3 lg:px-6 py-2 lg:py-4 pr-20 lg:pr-32 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none min-h-[44px] lg:min-h-[56px] max-h-32 text-sm lg:text-base",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                rows={1}
                disabled={disabled}
              />
              
              {/* Voice Input Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={isListening ? stopListening : startListening}
                className={cn(
                  "absolute right-10 lg:right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors p-1 lg:p-2",
                  isListening && "text-red-400 animate-pulse"
                )}
                disabled={disabled}
              >
                <Mic className="w-4 h-4 lg:w-5 lg:h-5" />
              </Button>
              
              {/* Send Button */}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!message.trim() || disabled}
                className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-1.5 lg:p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3 lg:w-4 lg:h-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-1 mt-2 lg:mt-4">
            {quickActions.map((action) => (
              <Button
                key={action.query}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickAction(action.query)}
                className="px-2 lg:px-4 py-1 lg:py-2 bg-slate-800/50 hover:bg-slate-700/70 text-gray-300 rounded-full text-xs lg:text-sm transition-colors backdrop-blur-sm border border-slate-700"
                disabled={disabled}
              >
                {action.label}
              </Button>
            ))}
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mt-1 lg:mt-3 text-xs text-gray-500 space-y-1 lg:space-y-0">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>Powered by DeepSeek AI, TMDb, RAWG & Serper</span>
          </div>
        </div>
      </div>
    </div>
  );
}
