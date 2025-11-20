import { GoogleGenAI, Type } from "@google/genai";
import { Match, MatchPrediction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts match pairings from an image of a betting slip.
 */
export async function extractMatchesFromImage(imageData: string): Promise<string[]> {
  const prompt = `Bu futbol maçı listesi veya bahis kuponu resmini analiz et. Her maçta oynayan iki takımın adını çıkar.
  Sonucu, her bir dizenin 'Takım A vs Takım B' olduğu geçerli bir JSON dizisi olarak döndür.
  Örneğin: ["Real Madrid vs Barcelona", "Liverpool vs Manchester City"].
  Maç bulunamazsa boş bir dizi döndür.`;

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: imageData,
    },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "İki takım arasındaki bir maç, ör. 'Takım A vs Takım B'",
          },
        },
    }
  });

  try {
    // FIX: Add a check for response.text to prevent errors on empty responses.
    const text = response.text;
    if (!text) {
      return [];
    }
    const jsonString = text.replace(/```json|```/g, '').trim();
    // Handle cases where the cleaned string is empty, which is not valid JSON.
    if (!jsonString) {
      return [];
    }
    const matches = JSON.parse(jsonString);
    if (Array.isArray(matches) && matches.every(item => typeof item === 'string')) {
      return matches;
    }
    return [];
  } catch (error) {
    console.error("Error parsing Gemini response for match extraction:", error);
    throw new Error("Yapay zeka, maçları beklenen formatta çıkaramadı.");
  }
}

/**
 * Generates predictions for a list of matches based on their stats.
 */
export async function getMatchPredictions(matches: Match[]): Promise<MatchPrediction[]> {
  const prompt = `Sen birinci sınıf bir futbol analizi uzmanısın. Sana birkaç futbol maçı için JSON verileri sunacağım.
  Her maç için, sağlanan istatistikleri (form, goller, kafa kafaya, vb.) analiz et ve olası bir tahmin sağla.
  
  Tahminin kısa bir sonuç olmalı (ör. 'Ev Sahibi Kazanır', 'Beraberlik', 'Deplasman Kazanır', '2.5 Üst Gol', 'Her İki Takım da Gol Atar').
  Gerekçen, tahmininin arkasındaki mantığı açıklayan kısa, uzman bir özet (1-2 cümle) olmalıdır.
  
  Geçerli bir JSON nesne dizisi döndür. Her nesne, o maçın girdi nesnesinin yapısıyla tam olarak eşleşmeli, ancak "prediction" (tahmin) ve "reasoning" (gerekçe) olmak üzere iki ek alan içermelidir.
  
  İşte maç verileri:
  ${JSON.stringify(matches, null, 2)}
  `;

  const teamSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
    },
    required: ['name'],
  };

  const statsSchema = {
    type: Type.OBJECT,
    properties: {
      form: { type: Type.STRING },
      goalsFor: { type: Type.NUMBER },
      goalsAgainst: { type: Type.NUMBER },
      possession: { type: Type.NUMBER },
      shotsOnTarget: { type: Type.NUMBER },
    },
    required: ['form', 'goalsFor', 'goalsAgainst', 'possession', 'shotsOnTarget'],
  };

  const headToHeadSchema = {
    type: Type.OBJECT,
    properties: {
      wins: { type: Type.NUMBER },
      draws: { type: Type.NUMBER },
      losses: { type: Type.NUMBER },
    },
    required: ['wins', 'draws', 'losses'],
  };

  const matchPredictionSchema = {
    type: Type.OBJECT,
    properties: {
      homeTeam: teamSchema,
      awayTeam: teamSchema,
      homeStats: statsSchema,
      awayStats: statsSchema,
      headToHead: {
        type: Type.OBJECT,
        properties: {
          home: headToHeadSchema,
          away: headToHeadSchema,
        },
        required: ['home', 'away'],
      },
      league: { type: Type.STRING },
      prediction: {
        type: Type.STRING,
        description:
          "Kısa bir sonuç (ör. 'Ev Sahibi Kazanır', 'Beraberlik', 'Deplasman Kazanır', '2.5 Üst Gol', 'Her İki Takım da Gol Atar').",
      },
      reasoning: {
        type: Type.STRING,
        description:
          'Tahminin arkasındaki mantığı açıklayan kısa, uzman bir özet (1-2 cümle).',
      },
    },
    required: [
      'homeTeam',
      'awayTeam',
      'homeStats',
      'awayStats',
      'headToHead',
      'league',
      'prediction',
      'reasoning',
    ],
  };

  const predictionsResponseSchema = {
    type: Type.ARRAY,
    items: matchPredictionSchema,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: predictionsResponseSchema,
    }
  });

  try {
    // FIX: Add a check for response.text to prevent errors on empty responses.
    const text = response.text;
    if (!text) {
      throw new Error("Yapay zeka'dan boş bir tahmin yanıtı alındı.");
    }
    const jsonString = text.replace(/```json|```/g, '').trim();
    const predictions = JSON.parse(jsonString);
    return predictions as MatchPrediction[];
  } catch (error) {
    console.error("Error parsing Gemini response for predictions:", error);
    throw new Error("Yapay zeka, tahminleri beklenen formatta oluşturamadı.");
  }
}