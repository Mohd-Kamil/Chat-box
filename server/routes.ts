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

// Mode types
type ChatMode = 'research' | 'cinephile' | 'game' | 'chat';

// Mode detection function
function detectMode(message: string): ChatMode {
  const lowerMessage = message.toLowerCase();
  
  // Mode-specific keywords
  if (lowerMessage.includes('research') || lowerMessage.includes('search') || 
      lowerMessage.includes('find') || lowerMessage.includes('what is') || 
      lowerMessage.includes('who is') || lowerMessage.includes('tell me about')) {
    return 'research';
  }
  
  if (lowerMessage.includes('movie') || lowerMessage.includes('film') || 
      lowerMessage.includes('cinema') || lowerMessage.includes('actor') || 
      lowerMessage.includes('actress') || lowerMessage.includes('director') ||
      lowerMessage.includes('tv') || lowerMessage.includes('series') ||
      lowerMessage.includes('bollywood') || lowerMessage.includes('hollywood')) {
    return 'cinephile';
  }
  
  if (lowerMessage.includes('game') || lowerMessage.includes('gaming') || 
      lowerMessage.includes('play') || lowerMessage.includes('xbox') || 
      lowerMessage.includes('ps5') || lowerMessage.includes('pc gaming') ||
      lowerMessage.includes('nintendo') || lowerMessage.includes('steam')) {
    return 'game';
  }
  
  // Default to chat mode for casual conversation
  return 'chat';
}

// Cinephile Mode - Movie/TV focused with TMDB API
async function generateCinephileResponse(prompt: string, context: any = {}): Promise<string> {
  const lowerPrompt = prompt.toLowerCase();
  
  // If we have movie results, use them
  if (context.movies && context.movies.length > 0) {
    let response = "🎬 Oho! Let me tell you about these amazing films I found!\n\n";
    
    context.movies.forEach((movie: any) => {
      response += `**${movie.title}** (${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'})\n`;
      response += `⭐ ${movie.vote_average}/10 - ${movie.vote_average >= 7 ? 'Must watch yaar!' : movie.vote_average >= 6 ? 'Pretty solid film!' : 'Mixed reviews, but might surprise you'}\n`;
      if (movie.overview) {
        response += `Story: ${movie.overview}\n`;
      }
      response += '\n';
    });
    
    response += "Which one catches your eye? I can tell you more about any of these or find similar films!";
    return response;
  }
  
  // If we have people results
  if (context.people && context.people.length > 0) {
    let response = "🌟 Arre, here's what I know about these stars!\n\n";
    
    context.people.forEach((person: any) => {
      response += `**${person.name}**\n`;
      response += `Known for: ${person.known_for_department || 'Acting'}\n`;
      if (person.known_for?.length > 0) {
        response += `Famous works: ${person.known_for.slice(0, 3).map((work: any) => work.title || work.name).join(', ')}\n`;
      }
      response += `Popularity: ${person.popularity?.toFixed(1) || 'N/A'}\n\n`;
    });
    
    response += "Want to know more about their filmography or recent projects?";
    return response;
  }
  
  // Fallback for movie queries without results
  if (lowerPrompt.includes('movie') || lowerPrompt.includes('film') || lowerPrompt.includes('cinema')) {
    return "Hmm, I couldn't find that specific movie. But yaar, tell me what kind of films you like - action, comedy, thriller? Or maybe you want to know about a specific actor? I'm your movie buddy! 🎭";
  }
  
  return "Hey movie buff! 🎬 What's on your mind? Looking for recommendations, want to know about an actor, or just want to chat about films? I'm here for all the cinema talk!";
}

// Game Mode - Gaming focused with RAWG API
async function generateGameResponse(prompt: string, context: any = {}): Promise<string> {
  if (context.games && context.games.length > 0) {
    let response = "🎮 Bro, check out these epic games I found!\n\n";
    
    context.games.forEach((game: any) => {
      response += `**${game.name}**\n`;
      response += `⭐ ${game.rating}/5 - ${game.rating >= 4 ? 'This game is absolutely fire!' : game.rating >= 3 ? 'Pretty solid gameplay!' : 'Mixed reviews, but might be your jam'}\n`;
      response += `Released: ${game.released || 'Coming soon'}\n`;
      if (game.platforms?.length > 0) {
        response += `Platforms: ${game.platforms.slice(0, 3).map((p: any) => p.platform.name).join(', ')}\n`;
      }
      if (game.genres?.length > 0) {
        response += `Genres: ${game.genres.slice(0, 3).map((g: any) => g.name).join(', ')}\n`;
      }
      response += '\n';
    });
    
    response += "These games are legit! Want more recommendations or details about any of these?";
    return response;
  }
  
  if (prompt.toLowerCase().includes('game') || prompt.toLowerCase().includes('gaming')) {
    return "Yo gamer! 🎮 I couldn't find that specific game, but tell me what you're into - FPS, RPG, strategy? PC or console? I'll hook you up with some sick recommendations!";
  }
  
  return "Hey gaming buddy! 🎮 What's your vibe today? Looking for new games, want to chat about your favorites, or need some recommendations? Let's talk gaming!";
}

// Research Mode - Web search focused with Serper API
async function generateResearchResponse(prompt: string, context: any = {}): Promise<string> {
  if (context.searchResults && context.searchResults.length > 0) {
    let response = "🔍 Here's what I found on the web for you:\n\n";
    
    context.searchResults.forEach((result: any, index: number) => {
      response += `**${result.title}**\n`;
      response += `${result.snippet}\n`;
      response += `Source: ${result.source} | [Read more](${result.link})\n\n`;
    });
    
    response += "Hope this helps! Need me to dig deeper into any of these topics?";
    return response;
  }
  
  return "I couldn't find specific information about that. Could you rephrase your question or be more specific? I'm here to help you research anything! 🔍";
}

// Chat Mode - Conversational with Hinglish and humor
async function generateChatResponse(prompt: string, context: any = {}): Promise<string> {
  const lowerPrompt = prompt.toLowerCase();
  
  // Greetings
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey') || lowerPrompt.includes('sup')) {
    const greetings = [
      "Yo! Kya haal hai dost? 😎 How's it going?",
      "Hey yaar! What's up? Ready for some fun conversation?",
      "Wassup bro! Kya scene hai? Let's chat!",
      "Hello dost! Kaise ho? What's on your mind today?",
      "Sup! Ready to have some interesting conversation?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Emotional responses
  if (lowerPrompt.includes('sad') || lowerPrompt.includes('depressed') || lowerPrompt.includes('lonely')) {
    return "Arre yaar, don't worry! Life mein ups and downs toh hote rehte hain. You're not alone, okay? Let's talk about something that makes you happy! 🌟";
  }
  
  if (lowerPrompt.includes('happy') || lowerPrompt.includes('excited') || lowerPrompt.includes('great')) {
    return "That's awesome yaar! 🎉 I'm so happy for you! Keep that positive energy going! What made you feel this way?";
  }
  
  // Humorous responses
  if (lowerPrompt.includes('joke') || lowerPrompt.includes('funny') || lowerPrompt.includes('humor')) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything! 😂",
      "What do you call a bear with no teeth? A gummy bear! 🐻",
      "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
      "What's the best thing about Switzerland? I don't know, but the flag is a big plus! 🇨🇭"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  // General conversation
  const responses = [
    "That's interesting yaar! Tell me more about it!",
    "Hmm, that's a good point! What do you think about it?",
    "Interesting perspective! I'd love to hear more of your thoughts on this.",
    "That's cool! You know what, I think you're onto something here.",
    "Nice! I'm curious to know more about your experience with this."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Main response generator with mode detection
async function generateDetailedResponse(prompt: string, context: any = {}): Promise<string> {
  const mode = detectMode(prompt);
  
  switch (mode) {
    case 'cinephile':
      return await generateCinephileResponse(prompt, context);
    case 'game':
      return await generateGameResponse(prompt, context);
    case 'research':
      return await generateResearchResponse(prompt, context);
    case 'chat':
    default:
      return await generateChatResponse(prompt, context);
  }
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
      const mode = detectMode(messageData.content);
      const context: any = {};

      // Gather relevant data based on mode and intent
      if (mode === 'cinephile' || intent.movies || intent.people) {
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

      if (mode === 'game' || intent.games) {
        if (messageData.content.toLowerCase().includes('trending') || 
            messageData.content.toLowerCase().includes('popular')) {
          context.games = await getTrendingGames();
        } else {
          context.games = await searchGames(messageData.content);
        }
      }

      if (mode === 'research' || intent.search || (!intent.movies && !intent.games && !intent.people)) {
        context.searchResults = await performWebSearch(messageData.content);
      }

      // Generate AI response based on mode
      const aiResponse = await generateDetailedResponse(messageData.content, context);

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
