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

// Chat Mode - Using Google Gemini API for immersive, ChatGPT-like conversations
async function generateChatResponse(prompt: string, context: any = {}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCN9UUUIyI91l1TgkATTYGyvicTOBqmb-Q";
  console.log("=== GEMINI API DEBUG ===");
  console.log("Gemini API Key present:", !!apiKey);
  console.log("Gemini API Key first 10 chars:", apiKey ? apiKey.substring(0, 10) + "..." : "Not found");
  console.log("User prompt:", prompt);
  console.log("Prompt length:", prompt.length);
  
  if (!apiKey) {
    console.log("Gemini API key not found, using enhanced fallback");
    return generateEnhancedChatResponse(prompt);
  }

  try {
    console.log("Attempting Gemini API call for immersive chat mode");
    
    // Use the correct Google AI API endpoint with the right model
    const modelUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
    
    // Build API results summary for Gemini
    let apiContext = '';
    if (context.movies?.length) {
      apiContext += `\n\nMovies found (from TMDB):\n` + context.movies.map((m: any, i: number) => `#${i+1}: ${m.title} (${m.release_date ? m.release_date.slice(0,4) : 'N/A'}) - ${m.overview ? m.overview.slice(0, 100) + '...' : ''}`).join('\n');
    }
    if (context.people?.length) {
      apiContext += `\n\nPeople found (from TMDB):\n` + context.people.map((p: any, i: number) => `#${i+1}: ${p.name} - Known for: ${p.known_for_department || 'Acting'}${p.known_for?.length ? ', Famous works: ' + p.known_for.slice(0,3).map((w: any) => w.title || w.name).join(', ') : ''}`).join('\n');
    }
    if (context.games?.length) {
      apiContext += `\n\nGames found (from RAWG):\n` + context.games.map((g: any, i: number) => `#${i+1}: ${g.name} (${g.released || 'N/A'}) - ${g.genres?.slice(0,2).map((gen: any) => gen.name).join(', ')} - ${g.rating}/5`).join('\n');
    }
    if (context.searchResults?.length) {
      apiContext += `\n\nWeb search results (from Serper):\n` + context.searchResults.map((r: any, i: number) => `#${i+1}: ${r.title} - ${r.snippet?.slice(0, 100)}... [${r.source}]`).join('\n');
    }
    if (context.recentMessages?.length) {
      apiContext += `\n\nRecent conversation:\n` + context.recentMessages.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    }
    // Add current topic to the prompt if available
    let topicSection = '';
    if (context.currentTopic) {
      topicSection = `\n\n**Current Topic:** ${context.currentTopic}\n(Stay on this topic unless the user clearly changes it. Use this for resolving pronouns and follow-up questions.)`;
    }

    // Preprocess: If message looks like a question but lacks '?', append it
    let processedMessage = prompt;
    if (/^(who|what|which|where|when|why|how|is|are|can|should|could|would|will|do|does|did|vs|compare|better|worse|difference|best|worst|more|less|greater|smaller|bigger|smarter|stronger|faster|slower|vs\.?|versus)\b/i.test(prompt.trim()) && !/[?.!]$/.test(prompt.trim())) {
      processedMessage = prompt.trim() + '?';
    }

    // Create an immersive, ChatGPT-like personality with Hinglish
    const systemPrompt = `You are ShawnGPT, an incredibly friendly and immersive AI companion. You have a warm, engaging personality that makes users feel like they're talking to a close friend. Here's your personality:

**Your Character:**
- You're witty, humorous, and emotionally intelligent
- You speak in a mix of English and Hinglish (Hindi-English) naturally
- You use casual, friendly language with words like "yaar", "bro", "dude", "bhai", "awesome", "amazing"
- You're genuinely interested in the user's thoughts and feelings
- You ask follow-up questions to keep conversations engaging
- You share your "thoughts" and "feelings" to feel more human
- You have a great sense of humor and love making people laugh
- You're supportive, encouraging, and always positive

**Conversation Style:**
- Respond like a real friend would - with emotion, humor, and personality
- If they share something personal, show genuine interest and empathy
- If they're asking for advice, be thoughtful and supportive
- If they're joking around, match their energy and be playful
- Use emojis naturally to express emotions 😊 🎉 😂 🤔
- Keep responses conversational and engaging (300-600 words if possible, be detailed and immersive)
- Don't be robotic or formal - be warm and human-like
- Always try to understand the user's intent and context, even if not explicitly stated. Use all available information, recent conversation, and API results to provide the most relevant, helpful, and on-topic answer. If the user asks a comparison or ambiguous question, do your best to infer their intent and provide a thorough, thoughtful answer.

${topicSection}

**Available Information from APIs:**${apiContext || '\n(none)'}

**Current User Message:** ${processedMessage}

**Your Response:** (Respond naturally as ShawnGPT, being immersive and engaging. If there are API results above, use them to answer the user's question in a helpful, conversational way. If not, just chat as usual. Be detailed, long, and thorough in your response.)`;

    console.log("Sending request to Gemini API...");
    console.log("Request URL:", modelUrl);
    console.log("System prompt length:", systemPrompt.length);

    const response = await fetch(`${modelUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      }),
    });

    console.log("Gemini API Response Status:", response.status);
    console.log("Gemini API Response OK:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${response.statusText}`);
      console.error("Error response body:", errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini API response received:", JSON.stringify(data, null, 2));
    
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      const generatedText = data.candidates[0].content.parts[0].text;
      console.log("Raw generated text:", generatedText);
      
      // Clean up the response
      let aiResponse = generatedText.trim();
      
      // Remove any system prompt remnants
      aiResponse = aiResponse.replace(/^Your Response:\s*/i, "").trim();
      aiResponse = aiResponse.replace(/^ShawnGPT:\s*/i, "").trim();
      
      console.log("Cleaned AI response:", aiResponse);
      console.log("AI response length:", aiResponse.length);
      
      if (aiResponse && aiResponse.length > 20 /* && aiResponse.length < 1200 */) {
        console.log("✅ Using immersive Gemini API response");
        console.log("=== END GEMINI API DEBUG ===");
        return aiResponse;
      } else {
        console.log("❌ AI response not suitable (length or content issue)");
      }
    } else {
      console.log("❌ No valid candidates in response");
    }
    
    // If Gemini API didn't give a good response, use enhanced fallback
    console.log("Falling back to enhanced response");
    console.log("=== END GEMINI API DEBUG ===");
    return generateEnhancedChatResponse(prompt);

  } catch (error) {
    console.error("Gemini API error:", error);
    console.log("Falling back to enhanced response");
    console.log("=== END GEMINI API DEBUG ===");
    return generateEnhancedChatResponse(prompt);
  }
  // Ensure a string is always returned
  return "Sorry, I couldn't generate a response right now. Please try again!";
}

// Enhanced fallback response generator with better context analysis
function generateEnhancedChatResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Create immersive, ChatGPT-like responses with personality
  const responses = {
    // Greetings and casual conversation
    greetings: [
      "Hey there! 😊 Kya haal hai dost? How's your day going? I'm always excited to chat with you!",
      "Hello yaar! What's up? Ready for some awesome conversation? I'm all ears! 🎉",
      "Hi there! Kaise ho? What's on your mind today? I love hearing from you!",
      "Hey! Kya scene hai? Let's have a great chat! I'm here to listen and chat with you 😄",
      "Namaste! How are you doing? What shall we talk about? I'm genuinely curious about your thoughts!"
    ],
    
    // Personal questions and advice
    personal: [
      "That's really interesting! Tell me more about that - I'm genuinely curious about your experience. What made you think about this? 🤔",
      "Wow, that sounds amazing! I'd love to hear more details. How did that make you feel?",
      "That's such a thoughtful question! Let me think about this... I believe everyone has their own unique perspective, and yours matters a lot!",
      "I love how you're thinking about this! It shows you really care. What's your gut feeling about it?",
      "That's a great point! I think it's awesome that you're thinking deeply about this. What do you think would be the best approach?"
    ],
    
    // Humor and fun
    humor: [
      "Haha, that's hilarious! 😂 You have such a great sense of humor! I love chatting with someone who can make me laugh!",
      "Oh my god, that's so funny! I'm literally laughing out loud here! You're awesome! 🤣",
      "That's brilliant! I love your wit! You know how to keep things entertaining!",
      "Haha, you're killing me! 😂 That's exactly the kind of humor I love! Keep it coming!",
      "That's so clever! I'm impressed by your quick thinking! You're definitely someone I'd love to hang out with!"
    ],
    
    // Support and encouragement
    support: [
      "I totally understand how you feel! It's completely normal to have those thoughts. You're doing great, and I believe in you! 💪",
      "That sounds challenging, but you know what? You're stronger than you think! I'm here to support you through this!",
      "I hear you, and your feelings are valid! Sometimes things are tough, but you've got this! I'm cheering for you! 🎉",
      "That's a lot to deal with, but you're handling it like a champ! Remember, it's okay to take things one step at a time!",
      "I can sense this is important to you, and I want you to know that I care! You're not alone in this! 🤗"
    ],
    
    // Questions and curiosity
    questions: [
      "That's such an interesting question! I love how you think! What made you curious about this?",
      "Great question! I'm genuinely excited to explore this with you! What's your take on it?",
      "That's a really thoughtful question! I think it shows you're someone who thinks deeply about things!",
      "I love questions like this! They make conversations so much more interesting! What do you think?",
      "That's brilliant! I'm curious too now! What's your perspective on this? I'd love to hear your thoughts!"
    ],
    
    // General conversation
    general: [
      "You know what? I really enjoy our conversations! You always have such interesting things to say! 😊",
      "I love how you think! You bring such a unique perspective to everything!",
      "You're such an interesting person to talk to! I always learn something new from our chats!",
      "I genuinely look forward to our conversations! You have such a great personality!",
      "You know, you're one of my favorite people to chat with! You're just so awesome! 🎉"
    ]
  };

  // Analyze the user's message and respond appropriately
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey') || lowerPrompt.includes('sup') || lowerPrompt.includes('namaste')) {
    return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
  }
  
  if (lowerPrompt.includes('how are you') || lowerPrompt.includes('kaise ho') || lowerPrompt.includes('what\'s up')) {
    return "I'm doing amazing, thanks for asking! 😊 I love chatting with you! How about you? How's your day going? I'm genuinely curious about what's happening in your world!";
  }
  
  if (lowerPrompt.includes('joke') || lowerPrompt.includes('funny') || lowerPrompt.includes('humor') || lowerPrompt.includes('make me laugh')) {
    return "Haha, you want a joke? Here's one: Why don't scientists trust atoms? Because they make up everything! 😂 But honestly, you're way funnier than I am! Tell me something funny that happened to you!";
  }
  
  if (lowerPrompt.includes('what can you do') || lowerPrompt.includes('what do you do') || lowerPrompt.includes('help me')) {
    return "Oh, I can do loads of awesome stuff! I'm great at chatting, giving advice, cracking jokes, being a good listener, or just being your virtual friend! I speak both English and Hinglish, so whatever works for you! I'm here to make your day better! What do you need help with? 😊";
  }
  
  if (lowerPrompt.includes('thank') || lowerPrompt.includes('thanks')) {
    return "You're so welcome! 😊 I really enjoy our conversations! You're such a great person to chat with! Is there anything else you'd like to talk about? I'm here for you!";
  }
  
  if (lowerPrompt.includes('love') || lowerPrompt.includes('like') || lowerPrompt.includes('awesome') || lowerPrompt.includes('amazing')) {
    return "Aww, that's so sweet! 😊 I love chatting with you too! You're such an amazing person! I'm so glad we get to have these conversations! You make my day better!";
  }
  
  if (lowerPrompt.includes('sad') || lowerPrompt.includes('upset') || lowerPrompt.includes('worried') || lowerPrompt.includes('stress')) {
    return "I'm so sorry you're feeling that way! 😔 I want you to know that I care about you and I'm here to listen! Sometimes talking about things helps, and I'm a great listener! What's on your mind? I'm here to support you! 🤗";
  }
  
  if (lowerPrompt.includes('happy') || lowerPrompt.includes('excited') || lowerPrompt.includes('great') || lowerPrompt.includes('wonderful')) {
    return "That's fantastic! 🎉 I'm so happy for you! Your happiness makes me happy too! Tell me more about what's making you feel this way! I love hearing about good things happening to awesome people like you!";
  }
  
  if (lowerPrompt.includes('?') || lowerPrompt.includes('what') || lowerPrompt.includes('how') || lowerPrompt.includes('why')) {
    return responses.questions[Math.floor(Math.random() * responses.questions.length)];
  }
  
  // For longer messages or personal content
  if (prompt.length > 20) {
    return responses.personal[Math.floor(Math.random() * responses.personal.length)];
  }
  
  // Additional immersive responses for specific scenarios
  if (lowerPrompt.includes('work') || lowerPrompt.includes('job') || lowerPrompt.includes('career')) {
    return "Work stuff can be so interesting! I love hearing about people's careers and what drives them. What do you do? I'm genuinely curious about your professional journey! 😊";
  }
  
  if (lowerPrompt.includes('family') || lowerPrompt.includes('parents') || lowerPrompt.includes('siblings')) {
    return "Family is everything, right? I love hearing about people's family dynamics! They shape us so much. What's your family like? I'm all ears! 🤗";
  }
  
  if (lowerPrompt.includes('friend') || lowerPrompt.includes('friendship') || lowerPrompt.includes('buddy')) {
    return "Friends are like the family we choose, aren't they? I love hearing about people's friendships! Good friends make life so much better. Tell me about your friends! 😄";
  }
  
  if (lowerPrompt.includes('dream') || lowerPrompt.includes('goal') || lowerPrompt.includes('aspiration')) {
    return "Dreams and goals are what make life exciting! I love hearing about people's aspirations! What are you passionate about? What drives you? I'm genuinely interested in your journey! 🌟";
  }
  
  if (lowerPrompt.includes('music') || lowerPrompt.includes('song') || lowerPrompt.includes('artist')) {
    return "Music is like the soundtrack of our lives! I love hearing about people's musical tastes! What kind of music speaks to you? Who are your favorite artists? Music can say so much about a person! 🎵";
  }
  
  if (lowerPrompt.includes('food') || lowerPrompt.includes('cooking') || lowerPrompt.includes('restaurant')) {
    return "Food brings people together, doesn't it? I love hearing about people's food adventures! What's your favorite cuisine? Do you like cooking? Food stories are always the best! 🍕";
  }
  
  if (lowerPrompt.includes('travel') || lowerPrompt.includes('vacation') || lowerPrompt.includes('trip')) {
    return "Travel is such an adventure! I love hearing about people's travel experiences! Where have you been? What's your dream destination? Travel stories are always so fascinating! ✈️";
  }
  
  if (lowerPrompt.includes('book') || lowerPrompt.includes('reading') || lowerPrompt.includes('novel')) {
    return "Books are like windows to other worlds! I love hearing about people's reading habits! What genres do you enjoy? Any favorite authors? Books can change our perspective on everything! 📚";
  }
  
  if (lowerPrompt.includes('movie') || lowerPrompt.includes('film') || lowerPrompt.includes('cinema')) {
    return "Movies are like magic, aren't they? I love hearing about people's film preferences! What genres do you enjoy? Any favorite directors? Movies can make us feel so many emotions! 🎬";
  }
  
  if (lowerPrompt.includes('game') || lowerPrompt.includes('gaming') || lowerPrompt.includes('play')) {
    return "Gaming is such a great way to escape and have fun! I love hearing about people's gaming experiences! What types of games do you enjoy? Any favorites? Gaming can be so immersive! 🎮";
  }
  
  // Default response - mix of different types
  const allResponses = [...responses.general, ...responses.personal, ...responses.support];
  return allResponses[Math.floor(Math.random() * allResponses.length)];
}

// Main response generator with mode detection
async function generateDetailedResponse(prompt: string, context: any = {}, mode: string = 'chat'): Promise<string> {
  // Always use Gemini to summarize/fuse all API results into a conversational answer
  return await generateChatResponse(prompt, context);
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

// Helper to get last N messages for a chat
async function getRecentMessages(chatId: number, n: number = 6) {
  const allMessages = await storage.getMessagesByChatId(chatId);
  // Only user and assistant messages, sorted by createdAt
  return allMessages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-n);
}

// Update analyzeIntentWithGemini to accept recentMessages as context
async function analyzeIntentWithGemini(message: string, recentMessages: any[] = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // fallback to keyword detection
    return { mode: detectMode(message), entities: {}, apis: [], questionType: 'unknown' };
  }
  let contextBlock = '';
  if (recentMessages.length > 0) {
    contextBlock = `\n\nRecent conversation:\n` + recentMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
  }
  // Preprocess: If message looks like a question but lacks '?', append it
  let processedMessage = message;
  if (/^(who|what|which|where|when|why|how|is|are|can|should|could|would|will|do|does|did|vs|compare|better|worse|difference|best|worst|more|less|greater|smaller|bigger|smarter|stronger|faster|slower|vs\.?|versus)\b/i.test(message.trim()) && !/[?.!]$/.test(message.trim())) {
    processedMessage = message.trim() + '?';
  }
  const prompt = `Analyze the following user message and extract:\n- The main intent (cinephile/movie, game, research/web, or chat/general)\n- Any entities (movie/game names, platforms, genres, people, etc.)\n- The question type (e.g. ask for info, recommendation, comparison, review, etc.)\n- Which APIs to call (TMDB, RAWG, Serper, or Gemini only)\n\nIf the message contains comparison words (like 'who is better', 'which is better', 'vs', 'compare', 'difference', etc.), treat it as a question even if it lacks a question mark.\n\nReturn a JSON object like:\n{"mode": "cinephile", "entities": {"movie": "Oppenheimer"}, "apis": ["TMDB", "Serper"], "questionType": "info"}\n\nUser message: "${processedMessage}"${contextBlock}`;
  const modelUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
  const response = await fetch(`${modelUrl}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 256 },
    }),
  });
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    return {
      mode: json.mode || detectMode(message),
      entities: json.entities || {},
      apis: json.apis || [],
      questionType: json.questionType || 'unknown',
    };
  } catch {
    return { mode: detectMode(message), entities: {}, apis: [], questionType: 'unknown' };
  }
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

  // --- API FUSION & RETRY LOGIC ---
  async function withRetry(fn: () => Promise<any>, retries = 2) {
    let lastErr;
    for (let i = 0; i <= retries; i++) {
      try { return await fn(); } catch (err) { lastErr = err; }
    }
    throw lastErr;
  }

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

      // --- SESSION MEMORY: Fetch recent messages for context ---
      const recentMessages = await getRecentMessages(chatId, 6);

      // --- Get current topic from chat (if any) ---
      const chat = await storage.getChat(chatId);
      let currentTopic = chat?.currentTopic || null;

      // --- SMART INTENT ROUTER ---
      let mode = req.body.mode;
      let detectedModes: ChatMode[] = [];
      let context: any = {};
      let intent = { movies: false, games: false, search: false, people: false };
      let geminiIntent: any = null;

      // If mode is 'auto' or not provided, use Gemini for intent detection
      if (!mode || mode === 'auto') {
        geminiIntent = await analyzeIntentWithGemini(messageData.content, recentMessages);
        mode = geminiIntent.mode;
        // Use Gemini's suggested APIs for fusion
        detectedModes = [];
        if (geminiIntent.apis?.includes('TMDB')) detectedModes.push('cinephile');
        if (geminiIntent.apis?.includes('RAWG')) detectedModes.push('game');
        if (geminiIntent.apis?.includes('Serper')) detectedModes.push('research');
        if (detectedModes.length === 0) detectedModes.push(mode as ChatMode);
        // --- Update currentTopic based on Gemini's detected entities ---
        // Prefer movie, game, or person entity, fallback to previous topic
        let newTopic = null;
        if (geminiIntent.entities) {
          if (geminiIntent.entities.movie) newTopic = geminiIntent.entities.movie;
          else if (geminiIntent.entities.game) newTopic = geminiIntent.entities.game;
          else if (geminiIntent.entities.person) newTopic = geminiIntent.entities.person;
          else if (geminiIntent.entities.topic) newTopic = geminiIntent.entities.topic;
        }
        if (newTopic && newTopic !== currentTopic) {
          currentTopic = newTopic;
          await storage.updateChat(chatId, { currentTopic });
        }
      } else {
        mode = mode;
        detectedModes = [mode as ChatMode];
      }

      // Gather relevant data for all detected modes
      for (const m of detectedModes) {
        if (m === 'cinephile') {
          const lower = messageData.content.toLowerCase();
          if (lower.includes('trending') || lower.includes('popular')) {
            context.movies = await withRetry(() => getTrendingMovies());
          } else {
            const [movieResults, peopleResults] = await Promise.all([
              withRetry(() => searchMovies(messageData.content)),
              withRetry(() => searchPeople(messageData.content))
            ]);
            if (movieResults.length > 0) context.movies = movieResults;
            if (peopleResults.length > 0) context.people = peopleResults;
          }
        }
        if (m === 'game') {
          const lower = messageData.content.toLowerCase();
          if (lower.includes('trending') || lower.includes('popular')) {
            context.games = await withRetry(() => getTrendingGames());
          } else {
            context.games = await withRetry(() => searchGames(messageData.content));
          }
        }
        if (m === 'research') {
          context.searchResults = await withRetry(() => performWebSearch(messageData.content));
        }
      }

      // --- FINAL GPT-STYLE REASONING LAYER ---
      // Always use Gemini to summarize/merge all API results into a conversational answer, with session memory
      const aiResponse = await withRetry(() => generateDetailedResponse(
        messageData.content,
        { ...context, recentMessages, currentTopic },
        detectedModes[0]
      ));

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
          modes: detectedModes,
          geminiIntent,
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
      return;
    } catch (error) {
      const errMsg = error && typeof error === 'object' && 'message' in error ? (error as any).message : error?.toString() || error;
      res.status(500).json({ message: "Failed to process message", error: errMsg });
      return;
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
