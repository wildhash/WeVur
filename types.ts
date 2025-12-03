export type OutputType = 'movie' | 'storybook';

export interface CreationFormData {
  title: string;
  prompt: string;
  outputType: OutputType;
}

export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
}

export interface StorybookPage {
  type: 'text' | 'image';
  content?: string;
  image_index?: number;
}

export interface StorybookResult {
  title: string;
  pages: StorybookPage[];
}

export interface MovieResult {
  videoUrl: string;
}

export type GenerationResult = StorybookResult | MovieResult | null;

// Export data structure for saved storybooks
export interface StorybookExportData {
  version: string;
  exportDate: string;
  storybook: StorybookResult;
  images: {
    index: number;
    fileName: string;
    mimeType: string;
    base64Data: string;
  }[];
}
