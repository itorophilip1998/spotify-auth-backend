
const jwt = require("jsonwebtoken");
const axios = require("axios");


// Environment variables
const {
    APPLE_TEAM_ID,
    APPLE_KEY_ID,
    APPLE_PRIVATE_KEY,
    APPLE_MUSIC_API_URL,
} = process.env;

// Generate Apple Music Developer Token
const loginAppleMusic = () => {
    const token = jwt.sign({}, APPLE_PRIVATE_KEY, {
        algorithm: "ES256",
        expiresIn: "180d",
        issuer: APPLE_TEAM_ID,
        header: {
            alg: "ES256",
            kid: APPLE_KEY_ID,
        },
    });
    return token;
}



// Save music to user's library
const addToAppleMusic = async (req, res) => {
    const { userToken, songId } = req.body;

    if (!userToken || !songId) {
        return res.status(400).json({ error: "Missing userToken or songId" });
    }

    try {
        const response = await axios.post(
            `${APPLE_MUSIC_API_URL}/me/library`,
            { ids: { songs: [songId] } },
            {
                headers: {
                    Authorization: `Bearer ${generateDeveloperToken()}`,
                    "Music-User-Token": userToken,
                },
            }
        );

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error("Error adding song to library:", error.response.data);
        res.status(500).json({ error: "Failed to add song to library" });
    }
}

module.exports = { addToAppleMusic, loginAppleMusic };