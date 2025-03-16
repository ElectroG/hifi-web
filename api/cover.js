// api/cover.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const trackId = req.query.trackId;
    try {
        const externalResponse = await fetch(`https://tidal.401658.xyz/cover/?id=${encodeURIComponent(trackId)}`);
        const jsonData = await externalResponse.json();

        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            return res.status(404).json({ error: 'Cover not found' });
        }

        const coverUrl640 = jsonData[0]['640'];
        if (!coverUrl640) {
            return res.status(404).json({ error: '640px cover not available' });
        }

        res.json({ coverUrl: coverUrl640 });
    } catch (error) {
        console.error("Cover error:", error);
        res.status(500).json({ error: 'Error fetching cover' });
    }
};