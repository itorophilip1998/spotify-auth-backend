const axios = require("axios");
const { generateDeveloperToken } = require("../controllers/appleMusic.Controller");
const {
    APPLE_MUSIC_API_URL,
} = process.env;

const appleMusicServices = async () => {
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

module.exports = { appleMusicServices };