import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema, type ChatResponse, type MovieRecommendation, type GameRecommendation, type SearchResult } from "@shared/schema";
import { z } from "zod";

// API client functions
async function searchMovies(query: string): Promise<MovieRecommendation[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error('TMDb API key not found');
    return [];
  }
  
  try {
    console.log(`Searching movies for: ${query}`);
    
    // First try exact search
    let response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
    );
    
    if (!response.ok) {
      console.error(`TMDb API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    let data = await response.json();
    
    // If no results, try alternative searches for common terms
    if (!data.results || data.results.length === 0) {
      const alternativeQueries = [];
      
      if (query.toLowerCase().includes('f1') || query.toLowerCase().includes('racing')) {
        alternativeQueries.push('rush', 'ford v ferrari', 'senna', 'grand prix');
      }
      if (query.toLowerCase().includes('recent') || query.toLowerCase().includes('new')) {
        // Get trending movies instead
        response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
        if (response.ok) {
          data = await response.json();
          console.log(`Found ${data.results?.length || 0} trending movies`);
          return data.results?.slice(0, 8) || [];
        }
      }
      
      // Try alternative queries
      for (const altQuery of alternativeQueries) {
        response = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(altQuery)}&language=en-US&page=1&include_adult=false`
        );
        if (response.ok) {
          data = await response.json();
          if (data.results && data.results.length > 0) {
            console.log(`Found ${data.results.length} movies with alternative query: ${altQuery}`);
            break;
          }
        }
      }
    }
    
    console.log(`Found ${data.results?.length || 0} movies`);
    return data.results?.slice(0, 8) || [];
  } catch (error) {
    console.error('TMDb API error:', error);
    return [];
  }
}

async function searchPeople(query: string): Promise<any[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error('TMDb API key not found for people search');
    return [];
  }
  
  try {
    console.log(`Searching people for: ${query}`);
    const response = await fetch(
      `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
    );
    
    if (!response.ok) {
      console.error(`TMDb People API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`Found ${data.results?.length || 0} people`);
    return data.results?.slice(0, 5) || [];
  } catch (error) {
    console.error('TMDb People API error:', error);
    return [];
  }
}

async function getMovieDetails(movieId: number): Promise<any> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;
  
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US&append_to_response=credits,reviews,similar`
    );
    return await response.json();
  } catch (error) {
    console.error('TMDb Movie Details API error:', error);
    return null;
  }
}

async function getTrendingMovies(): Promise<MovieRecommendation[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];
  
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`
    );
    const data = await response.json();
    return data.results?.slice(0, 6) || [];
  } catch (error) {
    console.error('TMDb API error:', error);
    return [];
  }
}

async function searchGames(query: string): Promise<GameRecommendation[]> {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    console.error('RAWG API key not found');
    return [];
  }
  
  try {
    console.log(`Searching games for: ${query}`);
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=6`
    );
    
    if (!response.ok) {
      console.error(`RAWG API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`Found ${data.results?.length || 0} games`);
    return data.results || [];
  } catch (error) {
    console.error('RAWG API error:', error);
    return [];
  }
}

async function getTrendingGames(): Promise<GameRecommendation[]> {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) return [];
  
  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${apiKey}&dates=2024-01-01,2024-12-31&ordering=-rating&page_size=6`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('RAWG API error:', error);
    return [];
  }
}

async function performWebSearch(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.error('Serper API key not found');
    return [];
  }
  
  try {
    console.log(`Performing web search for: ${query}`);
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, num: 5 }),
    });
    
    if (!response.ok) {
      console.error(`Serper API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`Found ${data.organic?.length || 0} search results`);
    
    return data.organic?.map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      source: new URL(result.link).hostname,
    })) || [];
  } catch (error) {
    console.error('Serper API error:', error);
    return [];
  }
}

async function generateResponse(prompt: string, context: any = {}): Promise<string> {
  return generateDetailedResponse(prompt, context);
}

async function generateDetailedResponse(prompt: string, context: any = {}): Promise<string> {
  let response = "";
  const lowerPrompt = prompt.toLowerCase();

  // Movies
  if (context.movies && context.movies.length > 0) {
    response += `Here are some movies I found for you!\n\n`;
    context.movies.forEach((movie: any) => {
      response += `🎬 **${movie.title}** (${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'})\n`;
      response += `⭐ ${movie.vote_average}/10 - ${movie.vote_average >= 7 ? 'Highly recommended!' : movie.vote_average >= 6 ? 'Pretty good!' : 'Mixed reviews'}\n`;
      if (movie.overview) response += `Story: ${movie.overview}\n`;
      response += '\n';
    });
    response += "Let me know if you want more details or recommendations!";
    return response;
  }

  // Games
  if (context.games && context.games.length > 0) {
    response += `Check out these games!\n\n`;
    context.games.forEach((game: any) => {
      response += `🎮 **${game.name}**\n`;
      response += `⭐ ${game.rating}/5 - ${game.rating >= 4 ? 'Top rated!' : game.rating >= 3 ? 'Worth a try!' : 'Mixed reviews'}\n`;
      response += `Released: ${game.released || 'Coming soon'}\n`;
      if (game.platforms?.length > 0) response += `Platforms: ${game.platforms.slice(0, 3).map((p: any) => p.platform.name).join(', ')}\n`;
      if (game.genres?.length > 0) response += `Genres: ${game.genres.slice(0, 3).map((g: any) => g.name).join(', ')}\n`;
      response += '\n';
    });
    response += "Want more game ideas or details? Just ask!";
    return response;
  }

  // People
  if (context.people && context.people.length > 0) {
    response += `Here's what I found about these people:\n\n`;
    context.people.forEach((person: any) => {
      response += `⭐ **${person.name}**\n`;
      response += `Known for: ${person.known_for_department || 'Acting'}\n`;
      if (person.known_for?.length > 0) response += `Famous works: ${person.known_for.slice(0, 3).map((work: any) => work.title || work.name).join(', ')}\n`;
      response += `Popularity: ${person.popularity?.toFixed(1) || 'N/A'}\n\n`;
    });
    response += "Want to know more about any of them?";
    return response;
  }

  // Web search
  if (context.searchResults && context.searchResults.length > 0) {
    response += `Here's what I found on the web:\n\n`;
    context.searchResults.forEach((result: any) => {
      response += `🔗 **${result.title}**\n`;
      response += `${result.snippet}\n`;
      response += `Source: ${result.source} | [Read more](${result.link})\n\n`;
    });
    response += "Let me know if you want more info on any of these!";
    return response;
  }

  // If no API results, fallback conversationally
  if (lowerPrompt.includes('movie') || lowerPrompt.includes('film') || lowerPrompt.includes('cinema')) {
    return "I couldn't find any movies for that, but tell me more! What genre, actor, or vibe are you looking for? I'll try again.";
  }
  if (lowerPrompt.includes('game') || lowerPrompt.includes('gaming')) {
    return "No games matched that search, but let me know your favorite genre or platform and I'll dig deeper!";
  }
  if (lowerPrompt.includes('actor') || lowerPrompt.includes('actress') || lowerPrompt.includes('director')) {
    return "Didn't find any people for that. Can you give me a full name or more details?";
  }
  if (lowerPrompt.includes('search') || lowerPrompt.includes('find') || lowerPrompt.length > 30) {
    return "I couldn't find anything on the web for that. Want to try rephrasing or ask about something else?";
  }

  // Friendly fallback
  return "I'm here to help with movies, games, web searches, or just to chat! Ask me anything.";
}

function generateFallbackResponse(prompt: string, context: any): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Casual greetings and responses
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey') || lowerPrompt.includes('sup') || lowerPrompt.includes('whats up')) {
    const greetings = [
      "Yo! What's good, bro? 😎 Ready to chat about movies, games, or just vibe?",
      "Hey there! Kya haal hai? What's on your mind today?",
      "Wassup dude! ShawnGPT here, ready to help with whatever you need. Movies? Games? Tech stuff?",
      "Hello yaar! How's it going? I'm here to chat about literally anything - movies, games, tech, you name it!",
      "Sup bro! Ready to explore some cool stuff together? What are you in the mood for?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  if (lowerPrompt.includes('movie') || lowerPrompt.includes('film') || lowerPrompt.includes('cinema')) {
    if (context.movies?.length) {
      return `Arre yaar, check out these dope movies! Found ${context.movies.length} solid picks for you. These are trending right now and definitely worth your time. Which one catches your eye?`;
    }
    return "Movies? Bro, you came to the right guy! What genre are you feeling? Action, comedy, thriller, Bollywood, Hollywood? Tell me your vibe and I'll hook you up with some fire recommendations!";
  }
  
  if (lowerPrompt.includes('game') || lowerPrompt.includes('gaming') || lowerPrompt.includes('play')) {
    if (context.games?.length) {
      return `Dude, these games are absolutely lit! Got ${context.games.length} bangers here that are crushing it right now. Perfect for some quality gaming time, yaar!`;
    }
    return "Gaming session incoming! What's your style bro? FPS, RPG, strategy, mobile games? PC or console? Tell me what gets you hyped and I'll find you some sick games!";
  }
  
  if (context.searchResults?.length) {
    return `Yo, did some digging on the web for you! Found some solid info that should answer your question. Check out these results - pretty helpful stuff, no cap!`;
  }
  
  // Tech-related queries
  if (lowerPrompt.includes('tech') || lowerPrompt.includes('technology') || lowerPrompt.includes('coding') || lowerPrompt.includes('programming')) {
    return "Tech talk? Let's go! I'm all about that digital life. Whether it's latest gadgets, coding, AI, or just general tech stuff - I got you covered, bro!";
  }
  
  // Default friendly response
  const defaultResponses = [
    "Yo! I'm ShawnGPT, your digital homie. Ready to chat about movies, games, tech, or just random stuff. What's on your mind?",
    "Hey bro! I'm here to help with whatever you need - entertainment, info, recommendations, or just casual chat. Fire away!",
    "Wassup! ShawnGPT at your service. Movies, games, tech news, random questions - I'm down for all of it. What do you wanna explore?",
    "Hello yaar! Your friendly neighborhood AI here. Let's talk about anything - I speak both English and Hinglish, so keep it real!"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function detectIntent(message: string): { movies: boolean; games: boolean; search: boolean; people: boolean } {
  const lowerMessage = message.toLowerCase();
  
  const movieKeywords = ['movie', 'film', 'cinema', 'bollywood', 'hollywood', 'series', 'show', 'tv', 'watch', 'f1', 'ford', 'ferrari', 'rush', 'senna', 'racing'];
  const gameKeywords = ['game', 'gaming', 'play', 'xbox', 'ps5', 'pc gaming', 'mobile game', 'nintendo', 'steam'];
  const peopleKeywords = ['actor', 'actress', 'director', 'star', 'celebrity', 'cast', 'brad pitt', 'tom hanks', 'leonardo', 'scarlett'];
  
  const movies = movieKeywords.some(keyword => lowerMessage.includes(keyword));
  const games = gameKeywords.some(keyword => lowerMessage.includes(keyword));
  const people = peopleKeywords.some(keyword => lowerMessage.includes(keyword));
  const search = !movies && !games && !people && (
    lowerMessage.includes('search') || lowerMessage.includes('find') || 
    lowerMessage.includes('what is') || lowerMessage.includes('tell me about') ||
    lowerMessage.includes('who is') || lowerMessage.includes('about') ||
    lowerMessage.length > 30  // Longer queries are likely search requests
  );
  
  return { movies, games, search, people };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all chats
  app.get("/api/chats", async (req, res) => {
    try {
      const chats = await storage.getChatsByUserId();
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  // Create new chat
  app.post("/api/chats", async (req, res) => {
    try {
      const chatData = insertChatSchema.parse(req.body);
      const chat = await storage.createChat(chatData);
      res.json(chat);
    } catch (error) {
      res.status(400).json({ message: "Invalid chat data" });
    }
  });

  // Get chat messages
  app.get("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const messages = await storage.getMessagesByChatId(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
  app.post("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const messageData = insertMessageSchema.parse({
        ...req.body,
        chatId,
      });

      // Save user message
      const userMessage = await storage.createMessage(messageData);

      // Detect intent and gather context
      const intent = detectIntent(messageData.content);
      const context: any = {};

      // Gather relevant data based on intent
      if (intent.movies || intent.people) {
        if (messageData.content.toLowerCase().includes('trending') || 
            messageData.content.toLowerCase().includes('popular')) {
          context.movies = await getTrendingMovies();
        } else {
          // Search for both movies and people
          const [movieResults, peopleResults] = await Promise.all([
            searchMovies(messageData.content),
            searchPeople(messageData.content)
          ]);
          
          if (movieResults.length > 0) {
            context.movies = movieResults;
          }
          
          if (peopleResults.length > 0) {
            context.people = peopleResults;
          }
        }
      }

      if (intent.games) {
        if (messageData.content.toLowerCase().includes('trending') || 
            messageData.content.toLowerCase().includes('popular')) {
          context.games = await getTrendingGames();
        } else {
          context.games = await searchGames(messageData.content);
        }
      }

      if (intent.search || (!intent.movies && !intent.games && !intent.people)) {
        context.searchResults = await performWebSearch(messageData.content);
      }

      // Generate AI response
      const aiResponse = await generateResponse(messageData.content, context);

      // Save AI message
      const aiMessage = await storage.createMessage({
        chatId,
        content: aiResponse,
        role: 'assistant',
        metadata: {
          sources: context.searchResults || [],
          movies: context.movies || [],
          games: context.games || [],
          people: context.people || [],
          generatedAt: new Date().toISOString(),
        },
      });

      // Update chat title if it's the first message
      const messages = await storage.getMessagesByChatId(chatId);
      if (messages.length === 2) { // user + ai message
        const title = messageData.content.slice(0, 50) + (messageData.content.length > 50 ? '...' : '');
        await storage.updateChat(chatId, { title });
      }

      const response: ChatResponse = {
        content: aiResponse,
        sources: context.searchResults,
        movies: context.movies,
        games: context.games,
        metadata: aiMessage.metadata as Record<string, any>,
      };

      res.json(response);
    } catch (error) {
      console.error('Message processing error:', error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Delete chat
  app.delete("/api/chats/:id", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const success = await storage.deleteChat(chatId);
      
      if (success) {
        res.json({ message: "Chat deleted successfully" });
      } else {
        res.status(404).json({ message: "Chat not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chat" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
