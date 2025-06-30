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
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="relative">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything, yaar... What's on your mind? 💬"
                className={cn(
                  "w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl px-6 py-4 pr-32 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none min-h-[56px] max-h-32",
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
                  "absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors p-2",
                  isListening && "text-red-400 animate-pulse"
                )}
                disabled={disabled}
              >
                <Mic className="w-5 h-5" />
              </Button>
              
              {/* Send Button */}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!message.trim() || disabled}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {quickActions.map((action) => (
              <Button
                key={action.query}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickAction(action.query)}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/70 text-gray-300 rounded-full text-sm transition-colors backdrop-blur-sm border border-slate-700"
                disabled={disabled}
              >
                {action.label}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>Powered by Hugging Face, TMDb, RAWG & Serper</span>
          </div>
        </div>
      </div>
    </div>
  );
}
