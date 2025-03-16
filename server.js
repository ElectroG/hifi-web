// server.js
const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the "public" folder
app.use(express.static('public'));

// Search endpoint - forwards request to the external API
app.get('/api/search', async (req, res) => {
    const query = req.query.query;
    console.log(`Searching for: ${query}`);
    try {
        const externalResponse = await fetch(`https://tidal.401658.xyz/search/?s=${encodeURIComponent(query)}`);
        if (!externalResponse.ok) {
            return res.status(500).json({ error: 'Error fetching external search results' });
        }
        const jsonData = await externalResponse.json();
        // Check if the expected 'items' array is present
        if (!jsonData.items || jsonData.items.length === 0) {
            return res.json([]);
        }
        // Return the list of tracks (each containing an id and other details)
        return res.json(jsonData.items);
    } catch (error) {
        console.error("Error in external search:", error);
        return res.status(500).json({ error: 'Error searching for tracks' });
    }
});

// server.js (updated track endpoint)
app.get('/api/track', async (req, res) => {
    const trackId = req.query.trackId;
    console.log(`Fetching track with ID: ${trackId}`);
    try {
        const externalResponse = await fetch(`https://tidal.401658.xyz/track/?id=${encodeURIComponent(trackId)}&quality=LOSSLESS`);
        if (!externalResponse.ok) {
            return res.status(500).json({ error: 'Error fetching external track details' });
        }
        const trackData = await externalResponse.json();

        // Extract OriginalTrackUrl from the array response
        let originalTrackUrl = null;
        if (Array.isArray(trackData)) {
            for (const item of trackData) {
                if (item.OriginalTrackUrl) {
                    originalTrackUrl = item.OriginalTrackUrl;
                    break;
                }
            }
        } else if (trackData.OriginalTrackUrl) {
            originalTrackUrl = trackData.OriginalTrackUrl;
        }

        if (!originalTrackUrl) {
            return res.status(500).json({ error: 'No track URL found' });
        }
        // Return an object with the OriginalTrackUrl for the frontend to use
        return res.json({ OriginalTrackUrl: originalTrackUrl });
    } catch (error) {
        console.error('Error fetching track:', error);
        return res.status(500).json({ error: 'Error fetching track' });
    }
});

// server.js (add this route)
app.get('/api/cover', async (req, res) => {
    const trackId = req.query.trackId;
    try {
        const externalResponse = await fetch(`https://tidal.401658.xyz/cover/?id=${encodeURIComponent(trackId)}`);
        const jsonData = await externalResponse.json();

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            return res.status(404).json({ error: 'Cover not found' });
        }

        const coverUrl640 = jsonData[0]['640'];
        if (!coverUrl640) {
            return res.status(404).json({ error: '640px cover not available' });
        }

        res.json({ coverUrl: coverUrl640 });
    } catch (error) {
        console.error('Cover error:', error);
        res.status(500).json({ error: 'Error fetching cover' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
