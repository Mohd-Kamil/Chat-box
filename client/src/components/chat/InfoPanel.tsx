import { useState, useEffect } from "react";
import { Languages, Mic, Search, Film, Zap } from "lucide-react";

interface ApiStatus {
  name: string;
  status: 'online' | 'offline' | 'checking';
}

export default function InfoPanel() {
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([
    { name: 'Hugging Face', status: 'checking' },
    { name: 'TMDb API', status: 'checking' },
    { name: 'RAWG API', status: 'checking' },
    { name: 'Serper API', status: 'checking' },
  ]);

  useEffect(() => {
    // Simulate API status checks
    const timer = setTimeout(() => {
      setApiStatuses([
        { name: 'Hugging Face', status: 'online' },
        { name: 'TMDb API', status: 'online' },
        { name: 'RAWG API', status: 'online' },
        { name: 'Serper API', status: 'online' },
      ]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full bg-card-dark border-l border-border-gray flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-6 border-b border-border-gray">
        <h3 className="text-lg font-semibold text-white">Quick Info</h3>
        <p className="text-sm text-gray-400">Helpful tips & features</p>
      </div>
      
      {/* Feature Cards */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Language Support Card */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Languages className="text-indigo-400 w-5 h-5" />
            <h4 className="text-white font-medium">Hinglish Support</h4>
          </div>
          <p className="text-sm text-gray-300">
            Mix English and Hindi naturally! I understand both languages and can respond accordingly.
          </p>
        </div>
        
        {/* Voice Input Card */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Mic className="text-emerald-400 w-5 h-5" />
            <h4 className="text-white font-medium">Voice Input</h4>
          </div>
          <p className="text-sm text-gray-300">
            Click the microphone icon to speak your questions instead of typing.
          </p>
        </div>
        
        {/* Research Card */}
        <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Search className="text-orange-400 w-5 h-5" />
            <h4 className="text-white font-medium">Real-time Research</h4>
          </div>
          <p className="text-sm text-gray-300">
            I can search the web and provide up-to-date information with sources.
          </p>
        </div>
        
        {/* Entertainment Card */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Film className="text-purple-400 w-5 h-5" />
            <h4 className="text-white font-medium">Entertainment</h4>
          </div>
          <p className="text-sm text-gray-300">
            Get personalized movie, TV show, and game recommendations based on trends.
          </p>
        </div>
      </div>
      
      {/* API Status */}
      <div className="p-6 border-t border-border-gray">
        <h4 className="text-white font-medium mb-3">API Status</h4>
        <div className="space-y-2">
          {apiStatuses.map((api) => (
            <div key={api.name} className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{api.name}</span>
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
