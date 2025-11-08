import React, { useState, useEffect } from 'react';
import ProductForm from './components/ProductForm';
import OutputDisplay from './components/ProductListing';
import { generateStorybook, generateMovie } from './services/geminiService';
import type { GenerationResult, UploadedImage, CreationFormData } from './types';
import SparklesIcon from './components/icons/SparklesIcon';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult>(null);
  const [submittedData, setSubmittedData] = useState<{
    formData: CreationFormData,
    images: UploadedImage[]
  } | null>(null);

  const handleSubmit = async (formData: CreationFormData, images: UploadedImage[]) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSubmittedData({ formData, images });

    try {
      let generationResult: GenerationResult = null;
      if (formData.outputType === 'storybook') {
        generationResult = await generateStorybook(formData, images);
      } else if (formData.outputType === 'movie') {
        generationResult = await generateMovie(formData, images);
      }
      setResult(generationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fix: Add reassuring loading messages for long video generation times.
  const loadingMessages = [
      "Brewing up a cinematic masterpiece...",
      "Teaching pixels to act...",
      "Untangling plot threads...",
      "Generating suspense (and video files)...",
      "The AI is on its coffee break, be back soon...",
      "Composing a blockbuster soundtrack...",
  ];
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  
  useEffect(() => {
    if (isLoading && submittedData?.formData.outputType === 'movie') {
        const intervalId = setInterval(() => {
            setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        }, 3000);
        return () => clearInterval(intervalId);
    }
  }, [isLoading, submittedData]);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center">
            <SparklesIcon className="w-8 h-8 text-indigo-400 mr-3"/>
            <h1 className="text-3xl font-bold tracking-tight">AI Story Weaver</h1>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Create your story</h2>
            <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 min-h-[400px] flex flex-col justify-center items-center">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Your Creation</h2>
            {isLoading && (
              <div className="text-center space-y-4 animate-fade-in">
                <div className="flex justify-center items-center">
                   <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <p className="text-lg font-medium">Generating, please wait...</p>
                {submittedData?.formData.outputType === 'movie' && <p className="text-gray-400">{loadingMessage}</p>}
                <p className="text-sm text-gray-500">This may take a few minutes, especially for movies.</p>
              </div>
            )}
            {error && <div className="text-red-400 text-center animate-fade-in"><strong>Error:</strong> {error}</div>}
            
            {result && submittedData && (
                <OutputDisplay result={result} outputType={submittedData.formData.outputType} uploadedImages={submittedData.images} />
            )}

            {!isLoading && !error && !result && (
              <div className="text-center text-gray-500">
                <p>Your generated storybook or movie will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-gray-600 border-t border-gray-800 mt-8">
        <p>Powered by Google Gemini API</p>
        <p><a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Billing Information for Video Generation</a></p>
      </footer>
    </div>
  );
}

export default App;
