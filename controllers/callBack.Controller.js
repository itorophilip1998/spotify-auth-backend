const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_TOKEN_URL,
    SPOTIFY_USER_PROFILE_URL,
    SPOTIFY_REDIRECT_URI
} = process.env;

const callbackController = async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Authorization failed!');
    }

    try {
        const tokenResponse = await axios.post(SPOTIFY_TOKEN_URL, new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: SPOTIFY_REDIRECT_URI,
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
        // addUser(user);  // Save user details to the database

        // res.cookie('access_token', access_token, { httpOnly: true });
        res.redirect("http://localhost:3000?code=" + access_token);



    } catch (error) {
        console.error(error.message);
        res.status(500).send('Authentication failed!');
    }
}
module.exports = { callbackController };