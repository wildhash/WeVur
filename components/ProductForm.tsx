import React, { useState, useCallback } from 'react';
import type { CreationFormData, OutputType, UploadedImage } from '../types';
import ImageEditor from './ImageEditor';
import SparklesIcon from './icons/SparklesIcon';
import LoaderIcon from './icons/LoaderIcon';
import EditIcon from './icons/EditIcon';

interface ProductFormProps {
  onSubmit: (formData: CreationFormData, images: UploadedImage[]) => void;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [outputType, setOutputType] = useState<OutputType>('storybook');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);

  const base64Encode = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        try {
          const base64 = await base64Encode(file);
          newImages.push({
            file,
            previewUrl: URL.createObjectURL(file),
            base64,
          });
        } catch (error) {
          console.error("Error processing file:", error);
        }
      }
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  }, []);

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      URL.revokeObjectURL(newImages[index].previewUrl);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleUpdateImage = (index: number, newBase64: string) => {
    setImages(prevImages => {
        const updatedImages = [...prevImages];
        const oldImage = updatedImages[index];

        URL.revokeObjectURL(oldImage.previewUrl);

        const byteCharacters = atob(newBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const newFile = new File([byteArray], oldImage.file.name, { type: oldImage.file.type });

        updatedImages[index] = {
            ...oldImage,
            file: newFile,
            base64: newBase64,
            previewUrl: URL.createObjectURL(newFile)
        };
        return updatedImages;
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData: CreationFormData = { title, prompt, outputType };
    onSubmit(formData, images);
  };
  
  const isFormValid = title.trim() && prompt.trim() && images.length > 0;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., The Adventures of Sparky the Robot"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">Story/Movie Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe the story or movie plot, characters, and style."
            disabled={isLoading}
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-300">Output Type</span>
          <div className="mt-2 flex gap-4">
            <label className={`flex items-center p-3 rounded-md cursor-pointer transition-all ${outputType === 'storybook' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
              <input type="radio" value="storybook" checked={outputType === 'storybook'} onChange={() => setOutputType('storybook')} className="hidden" disabled={isLoading} />
              <span className="text-white font-medium">Storybook</span>
            </label>
            <label className={`flex items-center p-3 rounded-md cursor-pointer transition-all ${outputType === 'movie' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
              <input type="radio" value="movie" checked={outputType === 'movie'} onChange={() => setOutputType('movie')} className="hidden" disabled={isLoading} />
              <span className="text-white font-medium">Movie</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Upload Images</label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div className="flex text-sm text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500">
                  <span>Upload files</span>
                  <input id="file-upload" name="file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={isLoading} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img src={image.previewUrl} alt={`upload-preview-${index}`} className="w-full h-32 object-cover rounded-md" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => setEditingImageIndex(index)} className="p-2 text-white hover:text-indigo-300" title="Edit Image">
                      <EditIcon className="w-6 h-6" />
                    </button>
                    <button type="button" onClick={() => handleRemoveImage(index)} className="p-2 text-white hover:text-red-400" title="Remove Image">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
        >
          {isLoading ? <><LoaderIcon /> Generating...</> : <><SparklesIcon /> Create</>}
        </button>
      </form>

      {editingImageIndex !== null && (
        <ImageEditor
          image={images[editingImageIndex]}
          onUpdate={(newBase64) => handleUpdateImage(editingImageIndex, newBase64)}
          onClose={() => setEditingImageIndex(null)}
        />
      )}
    </>
  );
};

export default ProductForm;
