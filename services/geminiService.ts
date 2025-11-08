import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { CreationFormData, StorybookResult, UploadedImage, MovieResult } from '../types';

// Add window.aistudio types for video generation key selection
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Fix: Initialize the Gemini AI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const storybookSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The title of the storybook."
    },
    pages: {
      type: Type.ARRAY,
      description: "An array of pages for the storybook.",
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: "The type of content on the page, either 'text' or 'image'."
          },
          content: {
            type: Type.STRING,
            description: "The text content for a 'text' page. Should be empty for 'image' pages."
          },
          image_index: {
            type: Type.NUMBER,
            description: "The 0-based index of the image from the provided images to display on an 'image' page. Should be empty for 'text' pages."
          }
        },
        required: ['type']
      }
    }
  },
  required: ['title', 'pages']
};


export const generateStorybook = async (formData: CreationFormData, images: UploadedImage[]): Promise<StorybookResult> => {
  const imageParts = images.map(image => ({
    inlineData: {
      mimeType: image.file.type,
      data: image.base64,
    },
  }));

  const prompt = `Create a storybook based on the following details:
Title: ${formData.title}
Prompt: ${formData.prompt}
Number of images provided: ${images.length}.

Please generate a story that incorporates the provided images. The story should be structured into pages. Each page can be either a block of text or one of the provided images.
You must use all the images provided. Refer to them by their index (e.g., image 0, image 1, etc.).
Return the result as a JSON object that follows the specified schema. The 'pages' array should interleave text and image pages to tell a compelling story.
`;

  const response = await ai.models.generateContent({
    // Fix: Use a model that is good for complex reasoning and JSON output.
    model: 'gemini-2.5-pro',
    contents: { parts: [{ text: prompt }, ...imageParts] },
    config: {
      responseMimeType: 'application/json',
      responseSchema: storybookSchema,
    },
  });

  const jsonResponse = response.text.trim();
  const result = JSON.parse(jsonResponse) as StorybookResult;
  
  if (!result.title || !Array.isArray(result.pages)) {
    throw new Error("Invalid storybook format received from API.");
  }

  return result;
};


export const generateMovie = async (formData: CreationFormData, images: UploadedImage[]): Promise<MovieResult> => {
  if (images.length === 0) {
    throw new Error("At least one image is required to generate a movie.");
  }

  // Fix: Per Veo guidelines, check if user has selected an API key.
  if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
  }

  // Fix: Per Veo guidelines, create a new AI instance right before the call to get the latest key.
  const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const image = {
    imageBytes: images[0].base64,
    mimeType: images[0].file.type
  };

  const prompt = `${formData.title}: ${formData.prompt}`;

  try {
    let operation = await localAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: image,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
  
    // Fix: Poll the operation status until it's done.
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await localAi.operations.getVideosOperation({ operation: operation });
    }
  
    if (operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Could not retrieve video URL.");
    }
  
    // Fix: Fetch the video using the URI and API key, then create a blob URL for display.
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
  
    return { videoUrl };

  } catch (error: any) {
    // Fix: Handle API key errors by prompting the user to select a key again.
    if (error.message && error.message.includes("Requested entity was not found.")) {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
      }
    }
    throw error;
  }
};


export const editImage = async (image: UploadedImage, prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: image.base64,
            mimeType: image.file.type,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      // Fix: Set response modality to IMAGE for image editing.
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("Image editing failed to produce an image.");
};
