import React, { useState, useEffect } from 'react';
import type { UploadedImage } from '../types';
import { editImage } from '../services/geminiService';
import LoaderIcon from './icons/LoaderIcon';
import SparklesIcon from './icons/SparklesIcon';
import RotateCwIcon from './icons/RotateCwIcon';

interface ImageEditorProps {
  image: UploadedImage;
  onUpdate: (newBase64: string) => void;
  onClose: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ image, onUpdate, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [currentImage, setCurrentImage] = useState(image.previewUrl);
  const [currentBase64, setCurrentBase64] = useState(image.base64);
  const [originalBase64] = useState(image.base64);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isTempUrl = currentImage.startsWith('blob:') && currentImage !== image.previewUrl;
    return () => {
      if (isTempUrl) {
        URL.revokeObjectURL(currentImage);
      }
    };
  }, [currentImage, image.previewUrl]);
  
  const handleEdit = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to edit the image.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const editedBase64 = await editImage({ ...image, base64: currentBase64 }, prompt);
      
      const byteCharacters = atob(editedBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const newFile = new File([byteArray], image.file.name, { type: image.file.type });
      
      const newPreviewUrl = URL.createObjectURL(newFile);

      setCurrentImage(newPreviewUrl);
      setCurrentBase64(editedBase64);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = () => {
    setCurrentBase64(originalBase64);
    setCurrentImage(image.previewUrl);
    setError(null);
  }

  const handleSave = () => {
    onUpdate(currentBase64);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in-fast">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-4xl text-white space-y-4 relative">
        <h2 className="text-2xl font-bold text-indigo-400">Edit Image</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center bg-gray-800/50 p-4 rounded-lg">
            <img src={currentImage} alt="Image to edit" className="max-w-full max-h-[50vh] rounded-md object-contain" />
          </div>
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                Editing Prompt
              </label>
              <textarea
                id="edit-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'add a futuristic helmet to the character'"
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                rows={4}
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleEdit}
              disabled={isLoading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {isLoading ? <><LoaderIcon /> Generating...</> : <><SparklesIcon /> Apply Edit</>}
            </button>
            <button
              onClick={handleRevert}
              disabled={isLoading || currentBase64 === originalBase64}
              className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500/50 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              <RotateCwIcon /> Revert to Original
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
           <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
