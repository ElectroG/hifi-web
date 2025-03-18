const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const trackId = req.query.trackId;
    if (!trackId) {
        return res.status(400).json({ error: 'Missing trackId parameter' });
    }

    const qualityPriorities = [
        'LOSSLESS',
        'HI_RES_LOSSLESS',
        'HI_RES',
        'HIGH',
        'LOW'
    ];

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        for (const quality of qualityPriorities) {
            const servers = [
                'https://tidal.401658.xyz',
                'https://hifi-04ed2aaea09a.herokuapp.com'
            ];

            for (const server of servers) {
                try {
                    const apiUrl = `${server}/track/?id=${encodeURIComponent(trackId)}&quality=${quality}`;
                    const response = await fetch(apiUrl);

                    if (!response.ok) continue;

                    const trackData = await response.json();
                    const originalUrl = trackData.find(item => item.OriginalTrackUrl)?.OriginalTrackUrl;

                    if (originalUrl) {
                        return res.json({
                            OriginalTrackUrl: originalUrl,
                            quality: quality // Add quality to response
                        });
                    }
                } catch (error) {
                    console.error(`Error with ${server} (${quality}):`, error.message);
                }
            }
        }
        return res.status(404).json({ error: 'Track not found in any quality or server' });
    } catch (outerError) {
        console.error("Unexpected error:", outerError);
        return res.status(500).json({ error: 'Internal server error' });
    }
};