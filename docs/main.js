// public/main.js
async function searchSong() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (!query) {
        alert('Please enter a search term');
        return;
    }

    try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const tracks = await response.json();

        if (tracks.length === 0) {
            showMessage('No results found');
            return;
        }

        displayResults(tracks);
    } catch (error) {
        console.error('Search failed:', error);
        showMessage('Error searching for tracks');
    }
}

function displayResults(tracks) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    tracks.forEach(track => {
        // Use track.artist.name if available, otherwise fallback to 'Unknown Artist'
        const artistName = track.artist && track.artist.name ? track.artist.name : 'Unknown Artist';
        const trackElement = document.createElement('div');
        trackElement.className = 'track-item';
        trackElement.innerHTML = `
      <div class="track-title">${track.title}</div>
      <div class="track-artist">${artistName}</div>
    `;
        trackElement.addEventListener('click', () => playTrack(track.id));
        resultsDiv.appendChild(trackElement);
    });
}

async function playTrack(trackId) {
    try {
        const response = await fetch(`/api/track?trackId=${trackId}`);
        const trackData = await response.json();

        if (!trackData.OriginalTrackUrl) {
            throw new Error('No track URL found');
        }

        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.classList.remove('hidden');
        audioPlayer.src = trackData.OriginalTrackUrl;
        audioPlayer.play();
    } catch (error) {
        console.error('Playback failed:', error);
        showMessage('Error playing track');
    }
}

function showMessage(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<div class="track-item">${message}</div>`;
}

// Trigger search on Enter key press
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchSong();
    }
});
