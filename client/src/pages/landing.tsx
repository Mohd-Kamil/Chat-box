import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Zap, Globe, Film, Gamepad, Mic, Search, ArrowRight, Star, Users, Sparkles, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const handleStartChat = () => {
    setLocation("/chat");
  };

  const features = [
    {
      id: "hinglish",
      icon: Globe,
      title: "Hinglish Support",
      description: "Chat naturally in English, Hindi, or mix both languages - I get you, yaar!",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "entertainment",
      icon: Film,
      title: "Entertainment Hub",
      description: "Get trending movies, TV shows, and game recommendations with real ratings",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "realtime",
      icon: Search,
      title: "Real-time Search",
      description: "Live web search with sources - stay updated with the latest information",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "voice",
      icon: Mic,
      title: "Voice Input",
      description: "Speak your questions instead of typing - hands-free conversations",
      color: "from-orange-500 to-red-500"
    }
  ];

  const quickActions = [
    { label: "🎬 Trending Movies", query: "What movies are trending right now?" },
    { label: "🎮 Popular Games", query: "Recommend some popular games for 2024" },
    { label: "📰 Tech News", query: "What's happening in tech today?" },
    { label: "🍿 Best Web Series", query: "Best web series to binge watch" },
    { label: "💻 AI Updates", query: "Latest AI developments and news" },
    { label: "🏆 Gaming Reviews", query: "Top rated games this month" }
  ];

  const handleQuickAction = (query: string) => {
    setLocation(`/chat?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 lg:px-6 py-4 lg:py-6 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="text-white w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">ShawnGPT</h1>
                <p className="text-xs lg:text-sm text-gray-400">Your AI Buddy</p>
              </div>
            </div>
            <Button
              onClick={() => setLocation('/chat')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base"
            >
              Start Chatting
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 lg:px-6 py-8 lg:py-16">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12 lg:mb-20">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 lg:mb-6">
                Meet <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ShawnGPT</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-300 mb-8 lg:mb-12 max-w-3xl mx-auto">
                Your friendly AI companion who speaks Hinglish, helps with research, recommends movies & games, and chats like a real friend! 🚀
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setLocation('/chat')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 lg:px-12 py-3 lg:py-4 text-lg lg:text-xl font-semibold"
                >
                  Start Chatting Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/chat?q=Tell me a joke')}
                  className="border-slate-600 text-white hover:bg-slate-800 hover:text-white px-8 lg:px-12 py-3 lg:py-4 text-lg lg:text-xl font-semibold bg-slate-800/50"
                >
                  Try a Joke 😄
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 lg:mb-20">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 lg:p-8 text-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 lg:mb-6 flex items-center justify-center">
                  <Languages className="text-white w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-white mb-2 lg:mb-3">Hinglish Support</h3>
                <p className="text-sm lg:text-base text-gray-400">
                  Chat naturally in English, Hindi, or mix both! Perfect for Indian users who love code-switching.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 lg:p-8 text-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mx-auto mb-4 lg:mb-6 flex items-center justify-center">
                  <Search className="text-white w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-white mb-2 lg:mb-3">Real-time Research</h3>
                <p className="text-sm lg:text-base text-gray-400">
                  Get up-to-date information from the web with proper sources and citations.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 lg:p-8 text-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-4 lg:mb-6 flex items-center justify-center">
                  <Film className="text-white w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-white mb-2 lg:mb-3">Movie & TV Expert</h3>
                <p className="text-sm lg:text-base text-gray-400">
                  Discover trending movies, TV shows, and get personalized recommendations.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 lg:p-8 text-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mx-auto mb-4 lg:mb-6 flex items-center justify-center">
                  <Zap className="text-white w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-white mb-2 lg:mb-3">Gaming Guru</h3>
                <p className="text-sm lg:text-base text-gray-400">
                  Find the latest games, reviews, and gaming recommendations for all platforms.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="text-2xl lg:text-3xl font-bold text-blue-400 mb-2">4+</div>
                <div className="text-gray-400 text-sm lg:text-base">AI Models</div>
              </div>
              <div className="p-6">
                <div className="text-2xl lg:text-3xl font-bold text-purple-400 mb-2">∞</div>
                <div className="text-gray-400 text-sm lg:text-base">Languages Supported</div>
              </div>
              <div className="p-6">
                <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-2">24/7</div>
                <div className="text-gray-400 text-sm lg:text-base">Always Available</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-6 py-6 lg:py-8 border-t border-slate-800 text-center text-gray-400">
          <p className="text-xs lg:text-sm">
            Powered by DeepSeek AI, TMDb, RAWG & Serper APIs • Built with ❤️ for real conversations
          </p>
        </footer>
      </div>
    </div>
  );
}