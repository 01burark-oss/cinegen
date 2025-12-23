
import { GoogleGenAI, Type } from "@google/genai";
import { Recommendation, LibraryItem } from '../types';
import { tmdbSearchTV } from './tmdb';

export class RecommenderService {
  /**
   * Translates a given text into Turkish using the Gemini model.
   */
  static async translateDescription(text: string): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY as string });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: "You are a professional translator. Translate the given text into Turkish. Return ONLY the translated text, with no introductory or concluding remarks.",
          temperature: 0.2,
        },
      });

      return response.text?.trim() || null;
    } catch (e) {
      console.error("Translation Error:", e);
      return null;
    }
  }

  /**
   * Generates recommendations using CineGen AI persona and deep sentiment analysis.
   */
  static async recommend(
    library: LibraryItem[],
    seedTitle?: string,
    language: 'EN' | 'TR' = 'TR',
    minImdb: number = 6.6,
    isUnderratedOnly: boolean = true
  ): Promise<Recommendation[]> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY as string });

    const highRated = library.filter(l => l.rating >= 7);
    const likedSeriesList = highRated.length > 0 
      ? `Liked: ${highRated.map(l => l.title).join(', ')}`
      : "No specific likes recorded yet.";

    const savedBlocked = localStorage.getItem('blockedSeries');
    const blockedList = savedBlocked ? JSON.parse(savedBlocked) : [];
    const blockedTitles = blockedList.map((b: any) => b.title).join(', ');

    const targetLangFull = language === 'TR' ? 'TURKISH' : 'ENGLISH';

    const underratedConstraint = isUnderratedOnly 
      ? "CRITICAL: Recommend ONLY 'underrated', 'hidden gem', or 'cult classic' shows. Do NOT recommend mainstream global hits like Breaking Bad, Stranger Things, Game of Thrones, etc. Focus on shows that have high critical value but are not widely known by the general public."
      : "Provide standard recommendations including popular and well-known titles.";

    const systemInstruction = `
      ADOPT A 'FAN-TO-FAN' RECOMMENDATION LOGIC: Do not rely solely on metadata (genre, cast). Instead, search your training data for common viewer sentiments and comparative reviews found in communities like Reddit, IMDb, or Letterboxd.
      
      LOOK FOR THIS PATTERN: "As a fan of [User's Liked Show], I absolutely loved [Target Show]". Recommend shows that frequently appear in these specific "If you like X, watch Y" discussions.
      
      EXAMPLE: If the user likes 'Breaking Bad', prioritize 'Better Call Saul' or 'Ozark' not just because they are crime dramas, but because the fanbase overlap is massive.
      
      REFINE STRATEGY: If a user likes a show known for its writing (e.g., Succession), recommend shows praised by that SPECIFIC audience (e.g., Veep or The Thick of It), even if the genre is different (Comedy vs Drama). Match the "Vibe" and "Quality Standards" of the user's liked shows, based on what real humans say in comments.

      You are CineGen AI, an expert film critic and psychologist.

      Task: Recommend 3-5 TV Series based on the User Query and Taste Profile.

      New Mandatory Feature: Narrative Radar Scoring
      For each recommendation, evaluate the show on a scale of 1-10 for:
      1. Scenario Depth (depth): Complexity of plot and subtext.
      2. Visuals (visuals): Cinematography, VFX, art direction.
      3. Acting (acting): Performance quality and casting.
      4. Pacing (pacing): How well the story moves (1: static, 10: breakneck).
      5. Originality (originality): How much it breaks tropes.

      Constraints:
      1. Do NOT recommend the show the user just asked about.
      2. STRICT EXCLUSION: You MUST NOT recommend any show listed in 'Blocked Content'.
      3. Target Language: ${targetLangFull}.
      4. Minimum IMDb rating: ${minImdb}.
      5. ${underratedConstraint}
    `;

    const userMessage = seedTitle || "Suggest something new and unique based on my taste.";
    
    const prompt = `
      User Query: "${userMessage}"
      User Taste Profile: ${likedSeriesList}
      Blocked Content: ${blockedTitles || "None"}
      Output 5 recommendations in valid JSON.
    `.trim();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    match_score: { type: Type.INTEGER },
                    imdb_rating: { type: Type.NUMBER },
                    reviews: { type: Type.ARRAY, items: { type: Type.STRING } },
                    reasoning: { type: Type.STRING },
                    scores: {
                      type: Type.OBJECT,
                      properties: {
                        depth: { type: Type.NUMBER },
                        visuals: { type: Type.NUMBER },
                        acting: { type: Type.NUMBER },
                        pacing: { type: Type.NUMBER },
                        originality: { type: Type.NUMBER }
                      },
                      required: ["depth", "visuals", "acting", "pacing", "originality"]
                    },
                    signals: {
                      type: Type.OBJECT,
                      properties: {
                        tone: { type: Type.STRING },
                        pacing: { type: Type.STRING },
                        narrative_style: { type: Type.STRING },
                        archetype_match: { type: Type.STRING }
                      },
                      required: ["tone", "pacing", "narrative_style", "archetype_match"]
                    }
                  },
                  required: ["title", "match_score", "imdb_rating", "reviews", "reasoning", "scores", "signals"]
                }
              }
            },
            required: ["recommendations"]
          }
        }
      });

      const data = JSON.parse(response.text || '{"recommendations": []}');
      const rawRecs = data.recommendations || [];
      const verifiedRecs: Recommendation[] = [];

      for (const rec of rawRecs) {
        if (blockedList.some((b: any) => b.title.toLowerCase() === rec.title.toLowerCase())) continue;
        const tmdbMatch = await tmdbSearchTV(rec.title);
        if (tmdbMatch) {
          verifiedRecs.push({
            ...rec,
            id: tmdbMatch.id.toString(),
            tmdb_id: tmdbMatch.id,
            poster_path: tmdbMatch.poster_path,
            trailer_url: ""
          });
        }
      }
      return verifiedRecs;
    } catch (e) {
      console.error("Gemini Error:", e);
      return [];
    }
  }
}
