import { useState, useEffect } from 'react';

function ImageDescriber() {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [description, setDescription] = useState('');
    const [copied, setCopied] = useState(false);

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const storedPassword = sessionStorage.getItem('app_password');

        try {
            // Always verify with server - if no password configured on server, it returns valid: true
            const res = await fetch('/api/verify-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: storedPassword || '' })
            });

            const data = await res.json();
            if (data.valid) {
                setIsAuthenticated(true);
            } else {
                // Only clear if we had a password that is now invalid
                if (storedPassword) sessionStorage.removeItem('app_password');
            }
        } catch (e) {
            console.error("Auth check failed", e);
        } finally {
            setAuthChecking(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthChecking(true);
        setAuthError('');

        try {
            const res = await fetch('/api/verify-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwordInput })
            });

            if (res.ok) {
                sessionStorage.setItem('app_password', passwordInput);
                setIsAuthenticated(true);
            } else {
                setAuthError('Incorrect password');
            }
        } catch (e) {
            setAuthError('Login failed. Please try again.');
        } finally {
            setAuthChecking(false);
        }
    };

    const generateDescription = async () => {
        if (!image) return;

        setLoading(true);
        setError('');
        setDescription('');
        setCopied(false);

        try {
            // Convert file to base64 for sending to server
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(image);
            });

            const imageData = await base64Promise;

            // Send to backend proxy
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const response = await fetch('/api/generate-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-app-password': sessionStorage.getItem('app_password') || ''
                },
                body: JSON.stringify({
                    imageData: imageData,
                    mimeType: image.type
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to generate description. Please try again.');
            }

            const data = await response.json();
            const generatedText = data.description;

            if (generatedText) {
                // Sanitize and clean up response
                const cleanText = generatedText
                    .trim()
                    .replace(/[<>]/g, '') // Remove potential HTML tags
                    .substring(0, 5000); // Limit length
                setDescription(cleanText);
            } else {
                throw new Error('No description generated.');
            }

        } catch (err) {
            if (err.name === 'AbortError') {
                setError('Request timed out. Please try again.');
            } else {
                setError(err.message || 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setError('');
            setDescription('');
            setCopied(false);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearReset = () => {
        setImage(null);
        setImagePreview(null);
        setDescription('');
        setError('');
        setCopied(false);
        // Reset file input
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
    };

    const copyToClipboard = async () => {
        if (description) {
            try {
                await navigator.clipboard.writeText(description);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    // Active constraints
    const constraints = [
        { label: 'No Face/Head', active: true, type: 'negative' },
        { label: 'No Hair/Hairstyle', active: true, type: 'negative' },
        { label: 'No Ethnicity', active: true, type: 'negative' },
        { label: 'Detailed Clothing', active: true, type: 'positive' },
        { label: 'Pose & Action', active: true, type: 'positive' },
        { label: 'Environment', active: true, type: 'positive' },
    ];

    if (authChecking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Authentication Required</h2>
                        <p className="text-gray-600 mt-2">Please enter the password to access this application.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Enter password"
                                autoFocus
                            />
                        </div>

                        {authError && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {authError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center"
                        >
                            Access Application
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-7xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Reference Describer
                    </h1>
                    <p className="text-gray-600">
                        Generates strict, neutral image descriptions excluding facial features. Optimized for texture, pose, and lighting references.
                    </p>
                </div>

                {/* Main Layout - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Image Preview */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="space-y-4">
                            {/* Image Preview Area */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[400px] flex items-center justify-center bg-gray-50 relative group">
                                {imagePreview ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-w-full max-h-[400px] object-contain rounded-lg"
                                        />
                                        {/* Reset button on image */}
                                        <button
                                            onClick={handleClearReset}
                                            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Clear image"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <label htmlFor="image-upload" className="cursor-pointer text-center w-full">
                                        <div className="text-gray-400 mb-4">
                                            <svg className="mx-auto h-16 w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <p className="text-lg font-medium text-gray-600">
                                            Click to upload an image
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                    </label>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={generateDescription}
                                    disabled={!image || loading}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span>Generate Description</span>
                                        </>
                                    )}
                                </button>

                                {image && (
                                    <button
                                        onClick={handleClearReset}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
                                        title="Clear and reset"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Reset</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Description & Constraints */}
                    <div className="space-y-6">
                        {/* Generated Description */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-4">
                                <svg className="w-6 h-6 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-800">Generated Prompt</h3>
                            </div>

                            {description ? (
                                <div className="space-y-3">
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                                    <p className="text-gray-400 text-center">
                                        Description will appear here
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Active Constraints */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                ACTIVE CONSTRAINTS
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {constraints.map((constraint, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${constraint.type === 'negative'
                                            ? 'bg-red-50 text-red-700'
                                            : 'bg-green-50 text-green-700'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${constraint.type === 'negative'
                                            ? 'bg-red-500'
                                            : 'bg-green-500'
                                            }`}></div>
                                        <span className="text-sm font-medium">{constraint.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-800 text-sm">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImageDescriber;
