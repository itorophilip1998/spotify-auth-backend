const axios = require("axios");

// Function to add a song to a user's Spotify library
const addSongToLibrary = async (accessToken, songLink) => {
    try {
        const response = await axios.post(
            "https://api.spotify.com/v1/me/tracks",
            { ids: [songLink] },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.status === 200;
    } catch (error) {
        console.error("Error adding song to library:", error);
        return false;
    }
};

module.exports = { addSongToLibrary };
