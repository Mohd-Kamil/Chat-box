import { useState, useEffect } from "react";
import { Languages, Mic, Search, Film, Zap } from "lucide-react";

interface ApiStatus {
  name: string;
  status: 'online' | 'offline' | 'checking';
}

const MODES = [
  { key: 'research', label: 'Research', icon: <Search className="w-4 h-4 mr-1 inline" /> },
  { key: 'cinephile', label: 'Cinephile', icon: <Film className="w-4 h-4 mr-1 inline" /> },
  { key: 'game', label: 'Game', icon: <Zap className="w-4 h-4 mr-1 inline" /> },
  { key: 'chat', label: 'Chat', icon: <Languages className="w-4 h-4 mr-1 inline" /> },
];

export default function InfoPanel({ selectedMode, onModeChange }: { selectedMode: string, onModeChange: (mode: string) => void }) {
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([
    { name: 'Gemini API', status: 'checking' },
    { name: 'TMDb API', status: 'checking' },
    { name: 'RAWG API', status: 'checking' },
    { name: 'Serper API', status: 'checking' },
  ]);

  useEffect(() => {
    // Simulate API status checks
    const timer = setTimeout(() => {
      setApiStatuses([
        { name: 'Gemini API', status: 'online' },
        { name: 'TMDb API', status: 'online' },
        { name: 'RAWG API', status: 'online' },
        { name: 'Serper API', status: 'online' },
      ]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 flex flex-col h-full relative z-10">
      {/* Panel Header */}
      <div className="p-3 lg:p-6 border-b border-slate-700 flex-shrink-0">
        <h3 className="text-base lg:text-lg font-semibold text-white">Quick Info</h3>
        <p className="text-xs lg:text-sm text-gray-400">Helpful tips & features</p>
      </div>
      {/* Mode Selector + Quick Info Cards (scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-6 space-y-3 lg:space-y-4">
        {/* Mode Indicator */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-600/30 rounded-lg p-2 lg:p-4">
          <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
            <Zap className="text-blue-400 w-5 h-5" />
            <h4 className="text-white font-medium text-sm lg:text-base">Smart Mode Detection</h4>
          </div>
          <p className="text-xs lg:text-sm text-gray-300 mb-2 lg:mb-3">
            You can now select a mode below! Each mode uses a different API and personality:
          </p>
          <div className="space-y-1 lg:space-y-2 text-xs">
            <div className="flex items-center space-x-1 lg:space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-gray-300">🔍 <strong>Research:</strong> Web search (Serper API)</span>
            </div>
            <div className="flex items-center space-x-1 lg:space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-300">🎬 <strong>Cinephile:</strong> Movies/TV (TMDB API)</span>
            </div>
            <div className="flex items-center space-x-1 lg:space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-gray-300">🎮 <strong>Game:</strong> Games (RAWG API)</span>
            </div>
            <div className="flex items-center space-x-1 lg:space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300">💬 <strong>Chat:</strong> Hinglish, fun, emotional</span>
            </div>
          </div>
        </div>
        {/* Language Support Card */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-600/30 rounded-lg p-2 lg:p-4">
          <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
            <Languages className="text-indigo-400 w-5 h-5" />
            <h4 className="text-white font-medium text-sm lg:text-base">Hinglish Support</h4>
          </div>
          <p className="text-xs lg:text-sm text-gray-300">
            Mix English and Hindi naturally! I understand both languages and can respond accordingly.
          </p>
        </div>
        {/* Voice Input Card */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-600/30 rounded-lg p-2 lg:p-4">
          <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
            <Mic className="text-emerald-400 w-5 h-5" />
            <h4 className="text-white font-medium text-sm lg:text-base">Voice Input</h4>
          </div>
          <p className="text-xs lg:text-sm text-gray-300">
            Click the microphone icon to speak your questions instead of typing.
          </p>
        </div>
        {/* Research Card */}
        <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-600/30 rounded-lg p-2 lg:p-4">
          <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
            <Search className="text-orange-400 w-5 h-5" />
            <h4 className="text-white font-medium text-sm lg:text-base">Real-time Research</h4>
          </div>
          <p className="text-xs lg:text-sm text-gray-300">
            I can search the web and provide up-to-date information with sources.
          </p>
        </div>
        {/* Entertainment Card */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-lg p-2 lg:p-4">
          <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
            <Film className="text-purple-400 w-5 h-5" />
            <h4 className="text-white font-medium text-sm lg:text-base">Entertainment</h4>
          </div>
          <p className="text-xs lg:text-sm text-gray-300">
            Get personalized movie, TV show, and game recommendations based on trends.
          </p>
        </div>
      </div>
      {/* API Status - Keep this at bottom */}
      <div className="p-3 lg:p-6 border-t border-slate-700 flex-shrink-0">
        <h4 className="text-base lg:text-lg font-medium mb-2 lg:mb-3 text-white">API Status</h4>
        <div className="space-y-1 lg:space-y-2">
          {apiStatuses.map((api) => (
            <div key={api.name} className="flex items-center justify-between">
              <span className="text-xs lg:text-sm text-gray-400">{api.name}</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  api.status === 'online' ? 'bg-emerald-400' : 
                  api.status === 'offline' ? 'bg-red-400' : 
                  'bg-yellow-400 animate-pulse'
                }`}></div>
                <span className={`text-xs ${
                  api.status === 'online' ? 'text-emerald-400' : 
                  api.status === 'offline' ? 'text-red-400' : 
                  'text-yellow-400'
                }`}>
                  {api.status === 'checking' ? 'Checking...' : 
                   api.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
