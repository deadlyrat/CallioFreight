import { GoogleGenAI } from '@google/genai';

// Helper to get a fresh client instance, ensuring it uses the latest selected key
export const getAIClient = () => {
  // The selected key is injected into process.env.API_KEY by the platform
  // If not present, fallback to the default GEMINI_API_KEY
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey });
};

export const generateSceneDescriptions = async (theme: string): Promise<string[]> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `I am making a children's coloring book about "${theme}".
      Provide exactly 5 distinct, simple scene descriptions for the pages.
      Format the output as a simple JSON array of strings.
      Example: ["A happy dinosaur eating leaves", "A dinosaur flying in space"]`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length >= 5) {
        return parsed.slice(0, 5);
      }
    }
  } catch (error) {
    console.error("Failed to generate scene descriptions:", error);
  }

  // Fallback
  return Array.from({ length: 5 }, (_, i) => `A simple coloring page scene about ${theme}, part ${i + 1}`);
};

export const generateColoringPageImage = async (scene: string, size: string): Promise<string | null> => {
  const ai = getAIClient();
  try {
    const prompt = `Black and white line art, coloring book page for kids, thick clean outlines, no shading, no grayscale, pure white background, simple and clear. Scene: ${scene}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          imageSize: size as any,
          aspectRatio: "3:4" // Good for portrait printing
        }
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error) {
    console.error("Failed to generate image:", error);
  }
  return null;
};
