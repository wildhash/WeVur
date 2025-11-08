import React from 'react';
import type { GenerationResult, OutputType, StorybookResult, MovieResult, UploadedImage } from '../types';

interface OutputDisplayProps {
    result: GenerationResult;
    outputType: OutputType;
    uploadedImages: UploadedImage[];
}

const StorybookViewer: React.FC<{ storybook: StorybookResult, images: UploadedImage[] }> = ({ storybook, images }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg animate-fade-in space-y-6 border border-gray-700 h-full overflow-y-auto">
        <h2 className="text-3xl font-bold text-indigo-400 text-center">{storybook.title}</h2>
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

const MoviePlayer: React.FC<{ movie: MovieResult }> = ({ movie }) => (
    <div className="bg-gray-800/50 p-2 sm:p-4 rounded-lg animate-fade-in border border-gray-700">
        <video controls src={movie.videoUrl} className="w-full rounded-md aspect-video">
            Your browser does not support the video tag.
        </video>
        <div className="p-4 text-center">
            <a 
                href={movie.videoUrl} 
                download="ai-story-weaver-movie.mp4"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                Download Movie
            </a>
        </div>
    </div>
);


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
