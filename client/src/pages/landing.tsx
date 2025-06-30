import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Zap, Globe, Film, Gamepad, Mic, Search, ArrowRight, Star, Users, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-8 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ShawnGPT</h1>
              <p className="text-sm text-gray-400">Your AI Buddy</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>All APIs Online</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-12 max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Powered by Multiple AI Models</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Chat Like a
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Real Friend
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your chill AI buddy who speaks Hinglish, knows the latest movies and games, 
              and can search the web for you. No formal BS - just real conversations, yaar!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg"
                onClick={handleStartChat}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Start Chatting
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>Instant responses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={cn(
                  "p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm transition-all duration-300 cursor-pointer",
                  hoveredFeature === feature.id 
                    ? "bg-slate-800/60 border-slate-600 shadow-lg transform scale-105" 
                    : "bg-slate-800/30 hover:bg-slate-800/50"
                )}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold mb-6">Try These Popular Queries</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleQuickAction(action.query)}
                  className="p-4 h-auto text-left bg-slate-800/30 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 transition-all"
                >
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">4+</div>
              <div className="text-gray-400">AI Models</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">∞</div>
              <div className="text-gray-400">Languages Supported</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-400">Always Available</div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-slate-800 text-center text-gray-400">
          <p className="text-sm">
            Powered by Hugging Face, TMDb, RAWG & Serper APIs • Built with ❤️ for real conversations
          </p>
        </footer>
      </div>
    </div>
  );
}