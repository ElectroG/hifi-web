const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const trackId = req.query.trackId;
    if (!trackId) {
        return res.status(400).json({ error: 'Missing trackId parameter' });
    }

    // Define quality priorities (in order of preference)
    const qualityPriorities = [
        'LOSSLESS',
        'HI_RES_LOSSLESS',
        'HI_RES',
        'HIGH',
        'LOW'
    ];

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        for (const quality of qualityPriorities) {
            try {
                const apiUrl = `https://tidal.401658.xyz/track/?id=${encodeURIComponent(trackId)}&quality=${quality}`;
                const response = await fetch(apiUrl);

                if (!response.ok) continue; // Skip to next quality if HTTP error

                const trackData = await response.json();
                const originalUrl = trackData.find(item => item.OriginalTrackUrl)?.OriginalTrackUrl;

                if (originalUrl) {
                    return res.json({ OriginalTrackUrl: originalUrl });
                }
            } catch (innerError) {
                // Log and continue to next quality if any error occurs
                console.error(`Error trying ${quality} quality:`, innerError);
            }
        }

        // If no qualities worked
        return res.status(404).json({ error: 'Track not found in any quality' });
    } catch (outerError) {
        console.error("Unexpected error:", outerError);
        return res.status(500).json({ error: 'Internal server error' });
    }
};