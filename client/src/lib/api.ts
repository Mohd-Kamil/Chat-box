// API utility functions for external services

interface TMDbMovieResponse {
  results: Array<{
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
    genre_ids: number[];
  }>;
}

interface RAWGGameResponse {
  results: Array<{
    id: number;
    name: string;
    background_image: string;
    rating: number;
    released: string;
    platforms: Array<{ platform: { name: string } }>;
    genres: Array<{ name: string }>;
  }>;
}

interface SerperSearchResponse {
  organic: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
}

export class APIClient {
  private static instance: APIClient;
  
  private constructor() {}
  
  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  async searchMovies(query: string): Promise<TMDbMovieResponse['results']> {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      console.warn('TMDb API key not found');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US`
      );
      
      if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status}`);
      }
      
      const data: TMDbMovieResponse = await response.json();
      return data.results.slice(0, 6);
    } catch (error) {
      console.error('TMDb API error:', error);
      return [];
    }
  }

  async getTrendingMovies(): Promise<TMDbMovieResponse['results']> {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      console.warn('TMDb API key not found');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status}`);
      }
      
      const data: TMDbMovieResponse = await response.json();
      return data.results.slice(0, 6);
    } catch (error) {
      console.error('TMDb API error:', error);
      return [];
    }
  }

  async searchGames(query: string): Promise<RAWGGameResponse['results']> {
    const apiKey = import.meta.env.VITE_RAWG_API_KEY;
    if (!apiKey) {
      console.warn('RAWG API key not found');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=6`
      );
      
      if (!response.ok) {
        throw new Error(`RAWG API error: ${response.status}`);
      }
      
      const data: RAWGGameResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('RAWG API error:', error);
      return [];
    }
  }

  async getTrendingGames(): Promise<RAWGGameResponse['results']> {
    const apiKey = import.meta.env.VITE_RAWG_API_KEY;
    if (!apiKey) {
      console.warn('RAWG API key not found');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?key=${apiKey}&dates=2024-01-01,2024-12-31&ordering=-rating&page_size=6`
      );
      
      if (!response.ok) {
        throw new Error(`RAWG API error: ${response.status}`);
      }
      
      const data: RAWGGameResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('RAWG API error:', error);
      return [];
    }
  }

  async performWebSearch(query: string): Promise<Array<{
    title: string;
    link: string;
    snippet: string;
    source: string;
  }>> {
    const apiKey = import.meta.env.VITE_SERPER_API_KEY;
    if (!apiKey) {
      console.warn('Serper API key not found');
      return [];
    }

    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query, num: 5 }),
      });
      
      if (!response.ok) {
        throw new Error(`Serper API error: ${response.status}`);
      }
      
      const data: SerperSearchResponse = await response.json();
      
      return data.organic?.map((result) => ({
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

  async generateAIResponse(prompt: string, context: any = {}): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not found');
      return "I'm sorry, I'm having trouble connecting to my AI services right now.";
    }

    try {
      let systemPrompt = `You are ShawnGPT, a friendly AI assistant that speaks both English and Hinglish (Hindi-English mix). You're knowledgeable about movies, games, technology, and current events. Respond naturally, mixing English and Hindi words when appropriate. Keep responses conversational and helpful.

User Query: ${prompt}`;

      if (context.movies?.length) {
        systemPrompt += `\n\nRelevant Movies: ${JSON.stringify(context.movies)}`;
      }
      if (context.games?.length) {
        systemPrompt += `\n\nRelevant Games: ${JSON.stringify(context.games)}`;
      }
      if (context.searchResults?.length) {
        systemPrompt += `\n\nWeb Search Results: ${JSON.stringify(context.searchResults)}`;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: systemPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 300,
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
      }
      
      return this.generateFallbackResponse(prompt, context);
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.generateFallbackResponse(prompt, context);
    }
  }

  private generateFallbackResponse(prompt: string, context: any): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('movie') || lowerPrompt.includes('film')) {
      if (context.movies?.length) {
        return `Here are some great movie recommendations! I found ${context.movies.length} movies that might interest you. Check out the cards below for details about each one. Kya lagta hai, koi pasand aaya?`;
      }
      return "I'd love to help you find some great movies! Can you tell me what genre you prefer or if you're looking for something specific?";
    }
    
    if (lowerPrompt.includes('game') || lowerPrompt.includes('gaming')) {
      if (context.games?.length) {
        return `Yahan pe kuch amazing games hai! I found ${context.games.length} games that are trending right now. These should keep you entertained for hours!`;
      }
      return "Gaming ke liye kya prefer karte ho? Action, RPG, strategy, ya kuch aur? I can recommend some great games!";
    }
    
    if (context.searchResults?.length) {
      return `I searched the web and found some relevant information for you. The search results below should help answer your question. Let me know if you need more details about any of these!`;
    }
    
    return "Thanks for your question! I'm here to help with movies, games, tech topics, and general queries. Feel free to ask me anything in English or Hinglish!";
  }
}

export const apiClient = APIClient.getInstance();
