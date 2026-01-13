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
