
import { GoogleGenAI } from "@google/genai";
import { AppState, AppMode } from '../types';

export const generateImageFromGemini = async (state: AppState): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-2.5-flash-image';
  
  let finalPrompt = state.prompt;

  // Add functional modifiers based on active presets
  if (state.mode === AppMode.CREATE) {
    switch (state.activeCreateFunction) {
      case 'sticker':
        finalPrompt = `Sticker style, die-cut, white border around, flat illustration: ${state.prompt}`;
        break;
      case 'text':
        finalPrompt = `Modern minimalist vector logo, clean lines, high contrast: ${state.prompt}`;
        break;
      case 'comic':
        finalPrompt = `Comic book art style, vibrant colors, bold outlines: ${state.prompt}`;
        break;
      default:
        finalPrompt = state.prompt;
    }
  } else {
    // Edit mode
    switch (state.activeEditFunction) {
      case 'retouch':
        finalPrompt = `Professionally retouch and enhance details: ${state.prompt}`;
        break;
      case 'style':
        finalPrompt = `Apply a unique artistic style while preserving the structure: ${state.prompt}`;
        break;
      case 'compose':
        finalPrompt = `Merge and blend these two images naturally into one scene: ${state.prompt}`;
        break;
      case 'add-remove':
        finalPrompt = `Add or modify elements according to: ${state.prompt}`;
        break;
    }
  }

  const parts: any[] = [{ text: finalPrompt }];

  // Add image parts if in edit mode
  if (state.mode === AppMode.EDIT && state.uploadedImage) {
    const base64Data = state.uploadedImage.split(',')[1];
    const mimeType = state.uploadedImage.split(';')[0].split(':')[1];
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });

    // Add second image if compose mode
    if (state.activeEditFunction === 'compose' && state.uploadedImage2) {
      const base64Data2 = state.uploadedImage2.split(',')[1];
      const mimeType2 = state.uploadedImage2.split(';')[0].split(':')[1];
      parts.push({
        inlineData: {
          data: base64Data2,
          mimeType: mimeType2
        }
      });
    }
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  // Extract the generated image from parts
  let imageUrl = '';
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString = part.inlineData.data;
      imageUrl = `data:image/png;base64,${base64EncodeString}`;
      break;
    }
  }

  if (!imageUrl) {
    throw new Error("No image part found in the response");
  }

  return imageUrl;
};
