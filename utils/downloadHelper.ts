/**
 * Download helper utilities for saving stories and videos locally
 */

import type { StorybookResult, UploadedImage } from '../types';

/**
 * Downloads a blob as a file to the user's device
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Downloads a storybook as a JSON file with embedded image data
 */
export const downloadStorybook = (
  storybook: StorybookResult,
  images: UploadedImage[],
  filename?: string
): void => {
  // Create a complete export with storybook data and image data
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    storybook: storybook,
    images: images.map((img, index) => ({
      index,
      fileName: img.file.name,
      mimeType: img.file.type,
      base64Data: img.base64,
    })),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  const defaultFilename = `${storybook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
  downloadBlob(blob, filename || defaultFilename);
};

/**
 * Downloads a video from a blob URL
 */
export const downloadVideo = async (
  videoUrl: string,
  filename?: string
): Promise<void> => {
  try {
    // Fetch the video blob from the URL
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const defaultFilename = `ai_story_video_${Date.now()}.mp4`;
    downloadBlob(blob, filename || defaultFilename);
  } catch (error) {
    console.error('Error downloading video:', error);
    throw new Error('Failed to download video. Please try again.');
  }
};

/**
 * Converts a video blob URL to a downloadable MP4 file
 * This is useful when the video is already a blob URL from Veo API
 */
export const downloadVideoFromBlobUrl = (
  blobUrl: string,
  filename?: string
): void => {
  const defaultFilename = `ai_story_video_${Date.now()}.mp4`;
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Loads a saved storybook from a JSON file
 */
export const loadStorybook = (file: File): Promise<{
  storybook: StorybookResult;
  images: UploadedImage[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate the format
        if (!data.storybook || !data.images) {
          throw new Error('Invalid storybook file format');
        }

        // Reconstruct images
        const images: UploadedImage[] = data.images.map((imgData: any) => {
          // Create a File object from base64
          const byteString = atob(imgData.base64Data);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: imgData.mimeType });
          const file = new File([blob], imgData.fileName, { type: imgData.mimeType });
          
          return {
            file,
            previewUrl: `data:${imgData.mimeType};base64,${imgData.base64Data}`,
            base64: imgData.base64Data,
          };
        });

        resolve({
          storybook: data.storybook,
          images,
        });
      } catch (error) {
        reject(new Error('Failed to parse storybook file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
