
const jwt = require("jsonwebtoken");
const axios = require("axios");


// Environment variables
const {
    APPLE_TEAM_ID,
    APPLE_KEY_ID,
    APPLE_PRIVATE_KEY, 
} = process.env;

// Generate Apple Music Developer Token
const generateDeveloperToken = () => {
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

   await appleMusicServices(userToken, songId, res);
}

module.exports = { addToAppleMusic, generateDeveloperToken };