const express = require('express');
const app = express();
const port = 3000;
const fetch = require('node-fetch');

// Serve static files from the "public" folder
app.use(express.static('public'));

// Generic fetch with fallback support
async function fetchWithFallback(urls) {
    let lastError = null;

    for (const url of urls) {
        try {
            const response = await fetch(url);
            if (response.ok) return response;
            lastError = new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
            lastError = error;
        }
        console.log(`Attempt failed for ${url}, trying next...`);
    }

    throw lastError || new Error('All fetch attempts failed');
}

// Search endpoint
app.get('/api/search', async (req, res) => {
    const query = req.query.query;
    console.log(`Searching for: ${query}`);

    try {
        const response = await fetchWithFallback([
            `https://tidal.401658.xyz/search/?s=${encodeURIComponent(query)}`,
            `https://hifi-04ed2aaea09a.herokuapp.com/search/?s=${encodeURIComponent(query)}`
        ]);

        const jsonData = await response.json();
        return res.json(jsonData.items || []);
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ error: 'Failed to search across all servers' });
    }
});

// Track endpoint
app.get('/api/track', async (req, res) => {
    const trackId = req.query.trackId;
    console.log(`Fetching track with ID: ${trackId}`);

    try {
        const response = await fetchWithFallback([
            `https://tidal.401658.xyz/track/?id=${trackId}&quality=LOSSLESS`,
            `https://hifi-04ed2aaea09a.herokuapp.com/track/?id=${trackId}&quality=LOSSLESS`
        ]);

        const trackData = await response.json();
        const originalUrl = trackData.find(item => item.OriginalTrackUrl)?.OriginalTrackUrl;

        return originalUrl
            ? res.json({ OriginalTrackUrl: originalUrl })
            : res.status(404).json({ error: 'Track URL not found' });
    } catch (error) {
        console.error('Track error:', error);
        return res.status(500).json({ error: 'Failed to fetch track from all servers' });
    }
});

// Cover endpoint
app.get('/api/cover', async (req, res) => {
    const trackId = req.query.trackId;
    console.log(`Fetching cover for track ID: ${trackId}`);

    try {
        const response = await fetchWithFallback([
            `https://tidal.401658.xyz/cover/?id=${trackId}`,
            `https://hifi-04ed2aaea09a.herokuapp.com/cover/?id=${trackId}`
        ]);

        const jsonData = await response.json();
        const coverUrl = jsonData[0]?.['640'];

        return coverUrl
            ? res.json({ coverUrl })
            : res.status(404).json({ error: 'Cover not found' });
    } catch (error) {
        console.error('Cover error:', error);
        return res.status(500).json({ error: 'Failed to fetch cover from all servers' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});