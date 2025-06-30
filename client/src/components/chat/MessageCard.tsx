import { useState } from "react";
import { type Message } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Bot, User, Copy, Share, ThumbsUp, ExternalLink, Film, Gamepad, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MessageCardProps {
  message: Message;
  isLatest?: boolean;
}

export default function MessageCard({ message, isLatest }: MessageCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({ title: "Copied to clipboard!" });
    } catch (error) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "ShawnGPT Response",
          text: message.content,
        });
      } else {
        await navigator.clipboard.writeText(message.content);
        toast({ title: "Response copied for sharing!" });
      }
    } catch (error) {
      toast({ title: "Failed to share", variant: "destructive" });
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({ 
      title: isLiked ? "Removed like" : "Liked response!",
      description: isLiked ? "" : "Thanks for the feedback!"
    });
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm px-6 py-4 shadow-lg">
          <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  const metadata = message.metadata as any;
  const sources = metadata?.sources || [];
  const movies = metadata?.movies || [];
  const games = metadata?.games || [];
  const people = metadata?.people || [];

  return (
    <div className="flex justify-start">
      <div className="max-w-4xl w-full">
        <div className={cn(
          "bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl rounded-tl-sm p-6 shadow-lg",
          isLatest && "animate-slide-up"
        )}>
          {/* Response Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="text-white w-4 h-4" />
            </div>
            <span className="text-white font-medium">ShawnGPT</span>
            <span className="text-xs text-gray-500">
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </div>

          {/* Response Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>

            {/* Movies Section */}
            {movies.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Film className="text-indigo-400 w-5 h-5 mr-2" />
                  Trending Movies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {movies.slice(0, 6).map((movie: any) => (
                    <div key={movie.id} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                      {movie.poster_path && (
                        <img 
                          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h4 className="text-white font-medium">{movie.title}</h4>
                      <p className="text-sm text-gray-400">
                        ⭐ {movie.vote_average?.toFixed(1)}/10
                        {movie.release_date && ` • ${new Date(movie.release_date).getFullYear()}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* People/Actors Section */}
            {people.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Users className="text-yellow-400 w-5 h-5 mr-2" />
                  Actors & People
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {people.slice(0, 6).map((person: any) => (
                    <div key={person.id} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                      {person.profile_path && (
                        <img 
                          src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                          alt={person.name}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h4 className="text-white font-medium">{person.name}</h4>
                      <p className="text-sm text-gray-400">
                        {person.known_for_department || 'Acting'}
                        {person.popularity && ` • ${person.popularity.toFixed(1)} popularity`}
                      </p>
                      {person.known_for?.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Known for: {person.known_for.slice(0, 2).map((work: any) => work.title || work.name).join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Games Section */}
            {games.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Gamepad className="text-emerald-400 w-5 h-5 mr-2" />
                  Popular Games
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {games.slice(0, 4).map((game: any) => (
                    <div key={game.id} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                      {game.background_image && (
                        <img 
                          src={game.background_image}
                          alt={game.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h4 className="text-white font-medium">{game.name}</h4>
                      <p className="text-sm text-gray-400">
                        ⭐ {game.rating?.toFixed(1)}/5
                        {game.platforms?.length > 0 && ` • ${game.platforms.slice(0, 2).map((p: any) => p.platform.name).join(', ')}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sources */}
          {sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <ExternalLink className="text-gray-400 w-4 h-4" />
                <span className="text-sm text-gray-400">Sources</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.slice(0, 3).map((source: any, index: number) => (
                  <a 
                    key={index}
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-full transition-colors"
                  >
                    <ExternalLink className="text-gray-400 w-3 h-3" />
                    <span className="text-gray-300">{source.source}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-gray-400 hover:text-white p-2"
              >
                <Copy className="w-4 h-4 mr-1" />
                <span className="text-sm">Copy</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-gray-400 hover:text-white p-2"
              >
                <Share className="w-4 h-4 mr-1" />
                <span className="text-sm">Share</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "text-gray-400 hover:text-emerald-400 p-2 transition-colors",
                  isLiked && "text-emerald-400"
                )}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                <span className="text-sm">Like</span>
              </Button>
            </div>
            
            {metadata?.generatedAt && (
              <div className="text-xs text-gray-500">
                Generated in {((new Date().getTime() - new Date(metadata.generatedAt).getTime()) / 1000).toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
