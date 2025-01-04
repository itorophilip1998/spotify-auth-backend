const axios = require("axios");

const addToLIbrary = async (req, res) => {
    try {
        const { songUrl, libraryId } = req.body;
        const accessToken = req.headers.authorization; // Extract token

        console.log('songUrl:', songUrl);  // Log the song URL for debugging
        console.log('accessToken:', accessToken);  // Log the access token for debugging
        console.log('libraryId:', libraryId);  // Log the libraryId for debugging
        // Validate that the URL is a valid Spotify song URL
        const trackIdRegex = /spotify\.com\/track\/([a-zA-Z0-9]{22})/;
        const match = songUrl.match(trackIdRegex);

        if (!match) {
            return res.status(400).send('Invalid Spotify song URL');
        }

        const trackId = match[1]; // Extract trackId from songUrl

        // Determine the endpoint based on the libraryId
        let endpoint = '';
        if (libraryId === 'my-library') {
            // Add to the user's library
            endpoint = `https://api.spotify.com/v1/me/tracks?ids=${trackId}`;
        } else {
            // Add to a playlist
            endpoint = `https://api.spotify.com/v1/playlists/${libraryId}/tracks?uris=spotify:track:${trackId}`;
        }


        // Add track to the selected library
        const addTrackResponse = await axios.post(
            endpoint, // Dynamic endpoint based on library selection
            null,
            {
                headers: {
                    Authorization: `${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log("addTrackResponse:", addTrackResponse);

        return res.status(200).json({ message: 'Song added to your library successfully!', addTrackResponse });
    } catch (error) {
        // console.error(error);
        return res.status(200).json({ error: error });
    }
}

module.exports = { addToLIbrary };