const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const trackId = req.query.trackId;
    try {
        const externalResponse = await fetch(`https://tidal.401658.xyz/track/?id=${encodeURIComponent(trackId)}&quality=LOSSLESS`);
        const trackData = await externalResponse.json();

        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');

        const originalTrackUrl = trackData.find(item => item.OriginalTrackUrl)?.OriginalTrackUrl;
        if (!originalTrackUrl) return res.status(404).json({ error: 'Track not found' });

        res.json({ OriginalTrackUrl: originalTrackUrl });
    } catch (error) {
        console.error("Track error:", error);
        res.status(500).json({ error: 'Error fetching track' });
    }
};