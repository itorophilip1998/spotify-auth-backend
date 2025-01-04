const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_AUTH_URL,
} = process.env;

const loginController = (req, res) => {
    const scope = "user-library-modify user-read-private user-read-email playlist-modify-public playlist-modify-private";

    const authUrl = `${SPOTIFY_AUTH_URL}?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(authUrl);
}

module.exports = { loginController };
