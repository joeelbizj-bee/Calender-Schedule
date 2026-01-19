
import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent, EventType } from "../types";

export const parseEventsFromTranscript = async (text: string, isTask: boolean = false): Promise<CalendarEvent[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const prompt = `
    You are an expert Personal Assistant. 
    Analyze the following ${isTask ? 'instruction set' : 'transcript'}.
    Today's date is ${today.toISOString().split('T')[0]}.
    
    If it's an instruction to create a recurring meeting (e.g., "second Thursday", "repeats third Wednesday"):
    1. Calculate the EXACT dates for all occurrences.
    2. Return each occurrence as an individual event object in the array.
    3. Ensure the 'title', 'time', 'duration', 'description' (bullet points), 'color', and 'notifications' are correctly mapped.
    
    Rules for response:
    - Format dates as YYYY-MM-DD.
    - If color "purple" is requested, set color to "#9333ea".
    - If specific notifications are requested (e.g. 24h email), include them in the notifications array.
    - Return a JSON array.

    Input:
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              startDate: { type: Type.STRING },
              endDate: { type: Type.STRING },
              time: { type: Type.STRING },
              duration: { type: Type.NUMBER },
              type: { type: Type.STRING },
              location: { type: Type.STRING },
              description: { type: Type.STRING },
              color: { type: Type.STRING },
              guests: { type: Type.ARRAY, items: { type: Type.STRING } },
              notifications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    timeBefore: { type: Type.NUMBER }
                  }
                }
              }
            },
            required: ["title", "startDate"]
          }
        }
      }
    });

    const output = response.text;
    if (!output) return [];
    
    return JSON.parse(output) as CalendarEvent[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
