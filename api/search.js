const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const query = req.query.query;
    try {
        const externalResponse = await fetch(`https://tidal.401658.xyz/search/?s=${encodeURIComponent(query)}`);
        const jsonData = await externalResponse.json();

        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');

        if (!jsonData.items) return res.json([]);
        res.json(jsonData.items);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: 'Error searching for tracks' });
    }
};