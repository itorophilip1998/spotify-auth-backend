const axios = require('axios'); // Ensure Axios is imported at the top

const addToLibrary = async (accessToken, songUrl, libraryId) => {
    try {
        console.log('Song URL:', songUrl); // Log the song URL for debugging
        console.log('Access Token:', accessToken); // Log the access token for debugging
        console.log('Library ID:', libraryId); // Log the libraryId for debugging

        // Validate that the URL is a valid Spotify song URL
        const trackIdRegex = /spotify\.com\/track\/([a-zA-Z0-9]{22})/;
        const match = songUrl.match(trackIdRegex);

        if (!match) {
            throw new Error('Invalid Spotify song URL'); // Throw error instead of returning response
        }

        const trackId = match[1]; // Extract trackId from songUrl

        // Determine the endpoint based on the libraryId
        const endpoint =
            libraryId === 'my-library'
                ? `https://api.spotify.com/v1/me/tracks?ids=${trackId}` // Add to user's library
                : `https://api.spotify.com/v1/playlists/${libraryId}/tracks?uris=spotify:track:${trackId}`; // Add to a playlist

        // Add track to the selected library or playlist
        const addTrackResponse = await axios.post(
            endpoint,
            null, // No request body needed for these endpoints
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Track successfully added:', addTrackResponse.data); // Log successful response

        // Return success message
        return {
            success: true,
            message: 'Song added to your library successfully!',
            data: addTrackResponse.data,
        };
    } catch (error) {
        console.error('Error adding song to library:', error.message || error);

        // Return error details
        return {
            success: false,
            message: 'Failed to add song to library',
            error: error.response?.data || error.message || error,
        };
    }
};

module.exports = {addToLibrary};
