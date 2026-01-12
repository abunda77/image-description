import React, { useState, useRef } from 'react';
import { Upload, Copy, RefreshCw, AlertCircle, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

const ImageDescriber = () => {
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);

    // Helper to convert file to base64
    const fileToGenerativePart = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                resolve({
                    inlineData: {
                        data: base64String,
                        mimeType: file.type
                    }
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file.');
                return;
            }
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setDescription('');
            setError('');
            setCopied(false);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file.');
                return;
            }
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setDescription('');
            setError('');
            setCopied(false);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const generateDescription = async () => {
        if (!image) return;

        setLoading(true);
        setError('');
        setDescription('');
        setCopied(false);

        try {
            const imagePart = await fileToGenerativePart(image);
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            const promptText = `
        Analyze this image and generate a strict visual description based on these rules:
        
        CRITICAL NEGATIVE CONSTRAINTS (DO NOT MENTION):
        - Face, head, eyes, nose, mouth, ears.
        - Hair, hairstyle, hair color, facial hair, beard, mustache.
        - Ethnicity, skin tone of the face, age, facial expressions.
        - Do NOT describe the head area at all.
        
        CONTENT REQUIREMENTS:
        - Focus ONLY on: Body posture, clothing (detailed), accessories, actions, objects, environment, lighting, atmosphere, perspective.
        
        FORMATTING RULES:
        1. Start EXACTLY with the subject and the literal text "(image reference)".
           Example: "a man "(image reference)" standing..." or "a woman "(image reference)" sitting..." or "a red car "(image reference)" parked..."
        2. Do NOT use opening phrases like "This image shows" or "A photo of".
        3. Output must be a SINGLE continuous paragraph.
        4. English only.
        5. Tone: Neutral, descriptive, factual. No opinions or storytelling.
        
        Generate the description now complying with all points above.
      `;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: promptText },
                                imagePart
                            ]
                        }]
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to generate description. Please try again.');
            }

            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (generatedText) {
                // Clean up any potential markdown formatting if the model adds it strictly
                const cleanText = generatedText.trim();
                setDescription(cleanText);
            } else {
                throw new Error('No description generated.');
            }

        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!description) return;

        // Fallback for iframe environments
        const textArea = document.createElement("textarea");
        textArea.value = description;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <header className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                        Reference Describer
                    </h1>
                    <p className="text-slate-500 max-w-2xl">
                        Generates strict, neutral image descriptions excluding facial features.
                        Optimized for texture, pose, and lighting references.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Input */}
                    <div className="flex flex-col gap-4">
                        <div
                            className={`
                relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out flex flex-col items-center justify-center min-h-[400px] bg-white
                ${image ? 'border-slate-300' : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/30'}
                ${loading ? 'opacity-50 pointer-events-none' : ''}
              `}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />

                            {previewUrl ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-h-[350px] max-w-full object-contain rounded shadow-sm"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-slate-700 transition-colors"
                                        title="Change Image"
                                    >
                                        <RefreshCw size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="text-center cursor-pointer"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload size={32} />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-1">Upload an Image</h3>
                                    <p className="text-slate-400 text-sm">Drag and drop or click to browse</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={generateDescription}
                            disabled={!image || loading}
                            className={`
                w-full py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-sm
                ${!image
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : loading
                                        ? 'bg-indigo-400 text-white cursor-wait'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md active:transform active:scale-[0.98]'}
              `}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Generate Description
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-start gap-3 border border-red-100">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Output */}
                    <div className="flex flex-col h-full min-h-[400px]">
                        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <ImageIcon size={18} />
                                    <span className="font-medium text-sm">Generated Prompt</span>
                                </div>
                                {description && (
                                    <button
                                        onClick={copyToClipboard}
                                        className={`
                      flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors
                      ${copied
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200'}
                    `}
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 p-6 relative">
                                {description ? (
                                    <div className="prose prose-slate max-w-none">
                                        <p className="text-lg leading-relaxed text-slate-800 whitespace-pre-wrap font-medium">
                                            {description}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 select-none">
                                        {loading ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                                                <p className="text-sm font-medium text-indigo-400">Processing visual elements...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-6xl mb-4 opacity-20">❝ ❞</p>
                                                <p className="text-sm">Description will appear here</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {description && (
                                <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
                                    Format: [subject] "(image reference)" [description]
                                </div>
                            )}
                        </div>

                        {/* Guidelines Card */}
                        <div className="mt-6 bg-white border border-slate-200 rounded-lg p-5">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Active Constraints</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-red-500">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                        <span>No Face/Head</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-red-500">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                        <span>No Hair/Hairstyle</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-red-500">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                        <span>No Ethnicity</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                        <span>Detailed Clothing</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                        <span>Pose & Action</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                        <span>Environment</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageDescriber;
