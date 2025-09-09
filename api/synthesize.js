// api/synthesize.js - Vercel Serverless Function
// This goes in your existing naijavoice-platform repo

export default async function handler(req, res) {
    // Enable CORS for your frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { text, voice = 'lagos-female', speed = 1.0 } = req.body;
        
        // Validation
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'No text provided' });
        }
        
        if (text.length > 500) {
            return res.status(400).json({ 
                error: 'Demo limited to 500 characters. Contact info@naijavoice.com for longer content.' 
            });
        }
        
        // Log the request (Vercel automatically logs this)
        console.log('TTS Request:', { 
            textLength: text.length, 
            voice, 
            speed,
            timestamp: new Date().toISOString() 
        });
        
        // For now, return a success response with order details
        // In production, this would generate actual audio
        const orderData = {
            id: Date.now(),
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            voice,
            speed,
            status: 'queued',
            message: 'Nigerian voice generation queued for manual processing',
            estimatedMinutes: Math.ceil(text.split(' ').length / 150),
            contact: 'We will email you the audio file within 2-4 hours',
            pricing: '₦200 per minute for express delivery'
        };
        
        // Return response that your frontend can handle
        res.status(200).json({
            success: true,
            audio: generatePlaceholderAudioData(text, voice),
            order: orderData,
            demo: true,
            nextSteps: 'For high-quality Nigerian voices, contact info@naijavoice.com'
        });
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Please try again or contact support'
        });
    }
}

function generatePlaceholderAudioData(text, voice) {
    // Generate a placeholder audio response for demo
    // This creates a data URL that browsers can handle
    
    const audioInfo = {
        text: text.substring(0, 50) + '...',
        voice,
        duration: Math.ceil(text.split(' ').length / 2), // Rough seconds estimate
        format: 'wav',
        sampleRate: 22050,
        channels: 1
    };
    
    // Return base64 encoded JSON as placeholder
    const audioData = btoa(JSON.stringify(audioInfo));
    
    return {
        url: `data:application/json;base64,${audioData}`,
        type: 'demo',
        message: 'This is a demo response. Actual Nigerian voice will be delivered via email.',
        downloadInstructions: 'Contact info@naijavoice.com with your order ID for audio download'
    };
}
