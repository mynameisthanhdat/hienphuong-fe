import { GoogleGenAI } from "@google/genai";
import { ImageSize } from "../types";
import i18n from "../i18n";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// 1. Chatbot Logic (gemini-3-pro-preview)
export const sendChatMessage = async (message: string, history: { role: string, parts: { text: string }[] }[]) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: i18n.t('gemini.systemInstruction'),
      },
      history: history // Pass previous history if needed for context
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return i18n.t('gemini.chatError');
  }
};

// 2. Fast Text Response (gemini-2.5-flash-lite-latest)
// Used for quick dynamic content like "Travel Tip of the Day"
export const getQuickTravelTip = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', // mapping for 'gemini-2.5-flash-lite' based on instructions
      contents: i18n.t('gemini.quickTipPrompt'),
    });
    return response.text;
  } catch (error) {
    console.error("Fast Text Error:", error);
    return i18n.t('gemini.quickTipFallback');
  }
};

// 3. Image Generation (gemini-3-pro-image-preview)
export const generateHotelImage = async (prompt: string, size: ImageSize) => {
  try {
    // Determine image config based on size
    // Note: The API guidance says "imageSize" is available for gemini-3-pro-image-preview
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          imageSize: size, // 1K, 2K, 4K
          aspectRatio: "16:9" 
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};
