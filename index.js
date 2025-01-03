require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const { addUser, getUsers } = require('./user-management');
const cors = require('cors');  // Import the cors package

const app = express();
const port = process.env.PORT || 8000;

app.use(cookieParser());
app.use(express.json());
// Use CORS middleware to enable CORS for all routes
app.use(cors({
    origin: '*',  // Adjust this to your frontend's URL (e.g., React app running on port 3001)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_USER_PROFILE_URL = "https://api.spotify.com/v1/me";
const SPOTIFY_TRACK_URL = "https://api.spotify.com/v1/tracks/";

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI,
} = process.env;

const redirectUri = SPOTIFY_REDIRECT_URI;

// Step 1: Redirect user to Spotify authentication page
app.get('/login', (req, res) => {
    const scope = "user-library-modify user-read-private user-read-email playlist-modify-public playlist-modify-private";

    const authUrl = `${SPOTIFY_AUTH_URL}?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(authUrl);
});

// Step 2: Callback to exchange the code for an access token
app.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Authorization failed!');
    }

    try {
        const tokenResponse = await axios.post(SPOTIFY_TOKEN_URL, new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: SPOTIFY_CLIENT_ID,
            client_secret: SPOTIFY_CLIENT_SECRET,
        }).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token } = tokenResponse.data;

        // Fetch user details
        const userResponse = await axios.get(SPOTIFY_USER_PROFILE_URL, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const user = userResponse.data;
        addUser(user); // Save the user to the local store

        // res.cookie('access_token', access_token, { httpOnly: true });
        res.redirect("http://localhost:3000?code=" + access_token);


        // res.send(`
        //     <h1>Welcome, ${user.display_name}!</h1>
        //     <p>Your email: ${user.email}</p>
        //     <p>Your Spotify ID: ${user.id}</p>
        //     <p><strong>User data saved successfully.</strong></p>
        // `);


    } catch (error) {
        console.error(error.message);
        res.status(500).send('Authentication failed!');
    }
});

// Endpoint to add song to the chosen library (playlist or My Library)
app.post('/add-song', async (req, res) => {
    const { songUrl, libraryId } = req.body;
    const accessToken = req.headers.authorization; // Extract token

    console.log('songUrl:', songUrl);  // Log the song URL for debugging
    console.log('accessToken:', accessToken);  // Log the access token for debugging
    console.log('libraryId:', libraryId);  // Log the libraryId for debugging

    try {
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

        return res.status(200).send({ message: 'Song added to your library successfully!', addTrackResponse });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error });
    }
});

// Fetch all users
app.get('/users', (req, res) => {
    const users = getUsers();
    res.json(users);
});




app.get('/track-details', async (req, res) => {
    const { songId } = req.query;

    if (!songId) {
        return res.status(400).json({ error: "Song ID is required" });
    }

    const accessToken = req.headers.authorization; // Extract the access token

    if (!accessToken) {
        return res.status(401).json({ error: "Unauthorized. No access token." });
    }

    // console.log(SPOTIFY_TRACK_URL + songId);
    try {
        // Fetch track details from Spotify using the track ID
        const trackResponse = await axios.get(SPOTIFY_TRACK_URL + songId, {
            headers: {
                Authorization: `${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        console.log(trackResponse);

        // Send track details to the frontend
        res.status(200).json({
            id: trackResponse.data.id,
            name: trackResponse.data.name,
            artists: trackResponse.data.artists.map((artist) => artist.name),
            album: trackResponse.data.album,
        });
    } catch (error) {
        // console.error(error);
        res.status(500).json({ error });
    }
});

// Endpoint to get user libraries (playlists)
app.get('/get-libraries', async (req, res) => {
    const accessToken = req.headers.authorization; // Extract token

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: {
                Authorization: `${accessToken}`,
            },
        });

        // Include "My Library" as an option in the libraries list
        const libraries = [
            { id: 'my-library', name: 'My Library' },
            ...response.data.items.map(item => ({ id: item.id, name: item.name }))
        ];

        res.json(libraries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch libraries' });
    }
});


// Start server
app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});
