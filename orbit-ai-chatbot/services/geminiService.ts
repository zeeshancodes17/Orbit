
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Personality } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public async *sendMessageStream(personality: Personality, history: Message[], newMessageText: string, image?: { data: string, mimeType: string }) {
    // Construct the contents including history and the new multi-modal part
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [
        ...(msg.image ? [{ inlineData: { data: msg.image.data, mimeType: msg.image.mimeType } }] : []),
        { text: msg.text }
      ]
    }));

    // Add the current user turn
    const currentUserParts: any[] = [{ text: newMessageText }];
    if (image) {
      currentUserParts.unshift({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }

    contents.push({
      role: 'user',
      parts: currentUserParts
    });

    const result = await this.ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: personality.systemInstruction,
      },
    });

    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      yield c.text || "";
    }
  }
}

export const geminiService = new GeminiService();
