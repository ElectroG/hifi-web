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

// public/main.js (update displayResults)
function displayResults(tracks) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    tracks.forEach(track => {
        const artistName = track.artist?.name || 'Unknown Artist';
        const trackElement = document.createElement('div');
        trackElement.className = 'track-item';
        trackElement.innerHTML = `
            <div class="cover-placeholder"></div>
            <div class="track-info">
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${artistName}</div>
            </div>
        `;
        trackElement.addEventListener('click', () => playTrack(track.id));
        resultsDiv.appendChild(trackElement);

        // Load cover art
        loadCoverArt(track.id, trackElement.querySelector('.cover-placeholder'));
    });
}

async function loadCoverArt(trackId, container) {
    try {
        const response = await fetch(`/api/cover?trackId=${trackId}`);
        const data = await response.json();

        if (data.coverUrl) {
            const img = document.createElement('img');
            img.className = 'track-cover';
            img.src = data.coverUrl;
            img.alt = 'Album cover';
            container.replaceWith(img);
        }
    } catch (error) {
        console.error('Error loading cover art:', error);
    }
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

// State variable for repeat mode
let isRepeatOn = false;

// Function to toggle repeat mode
function toggleRepeat() {
    isRepeatOn = !isRepeatOn;
    const repeatButton = document.getElementById('repeatButton');
    repeatButton.textContent = `Repeat: ${isRepeatOn ? 'On' : 'Off'}`;
}

// Update playTrack function
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

        // Event listener for track end
        audioPlayer.onended = () => {
            if (isRepeatOn) {
                audioPlayer.currentTime = 0;
                audioPlayer.play();
            }
        };
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