import React, { useState } from 'react';
import type { GenerationResult, OutputType, StorybookResult, MovieResult, UploadedImage } from '../types';
import { downloadStorybook, downloadVideoFromBlobUrl } from '../utils/downloadHelper';

interface OutputDisplayProps {
    result: GenerationResult;
    outputType: OutputType;
    uploadedImages: UploadedImage[];
}

const StorybookViewer: React.FC<{ storybook: StorybookResult, images: UploadedImage[] }> = ({ storybook, images }) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        try {
            setIsSaving(true);
            downloadStorybook(storybook, images);
        } catch (error) {
            console.error('Error saving storybook:', error);
            alert('Failed to save storybook. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg animate-fade-in space-y-6 border border-gray-700 h-full overflow-y-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-indigo-400">{storybook.title}</h2>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {isSaving ? 'Saving...' : 'Save Story'}
                </button>
            </div>
            <div className="space-y-4">
                {storybook.pages.map((page, index) => {
                    if (page.type === 'text') {
                        return <p key={index} className="text-gray-300 whitespace-pre-wrap leading-relaxed">{page.content}</p>
                    }
                    if (page.type === 'image' && page.image_index !== undefined && images[page.image_index]) {
                        return (
                            <div key={index} className="flex justify-center">
                                <img 
                                    src={images[page.image_index].previewUrl} 
                                    alt={`Story image ${page.image_index + 1}`}
                                    className="rounded-lg max-w-full h-auto shadow-lg"
                                />
                            </div>
                        )
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

const MoviePlayer: React.FC<{ movie: MovieResult }> = ({ movie }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        try {
            setIsDownloading(true);
            downloadVideoFromBlobUrl(movie.videoUrl);
        } catch (error) {
            console.error('Error downloading video:', error);
            alert('Failed to download video. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="bg-gray-800/50 p-2 sm:p-4 rounded-lg animate-fade-in border border-gray-700">
            <video controls src={movie.videoUrl} className="w-full rounded-md aspect-video">
                Your browser does not support the video tag.
            </video>
            <div className="p-4 text-center">
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {isDownloading ? 'Downloading...' : 'Download Video'}
                </button>
            </div>
        </div>
    );
};


const OutputDisplay: React.FC<OutputDisplayProps> = ({ result, outputType, uploadedImages }) => {
    if (!result) return null;

    if (outputType === 'storybook') {
        return <StorybookViewer storybook={result as StorybookResult} images={uploadedImages} />;
    }

    if (outputType === 'movie') {
        return <MoviePlayer movie={result as MovieResult} />;
    }

    return null;
};

export default OutputDisplay;
