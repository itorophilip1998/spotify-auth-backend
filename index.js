require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const { addUser, getUsers } = require('./user-management');
const cors = require('cors');  // Import the cors package
const { loginController } = require('./controllers/login.Controller');
const { callbackController } = require('./controllers/callBack.Controller');
const { addSongController } = require('./controllers/addSong.Controller');
const { trackDetailsController } = require('./controllers/trackDetails.Controller');
const { getLibraryController } = require('./controllers/getLibrary.Controller');
const { preSaveController, getPresaveController, handlePresave } = require('./controllers/presave.Controller');
const { router } = require('bull-board');
const { taskQueue } = require('./taskQueue');  // Import your taskQueue
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


app.get('/login', loginController);

// Step 2: Callback to exchange the code for an access token
app.get('/callback', callbackController);

// Endpoint to add song to the chosen library (playlist or My Library)
app.post('/add-song', addSongController);


// Endpoint to get track details
app.get('/track-details', trackDetailsController);


// Fetch all users
app.get('/users', (req, res) => {
    const users = getUsers();
    res.json(users);
});


// Endpoint to get user libraries (playlists)
app.get('/get-libraries', getLibraryController);


// Endpoint to pre-save a song
app.post('/presave', preSaveController);

// Endpoint to pre-save a song
app.get('/get-presave', getPresaveController);

// Endpoint to handle pre-save
app.post("/presave/:presaveID", handlePresave);


// Set up Bull Board to monitor the taskQueue
const { setQueues, BullAdapter } = require('bull-board');
setQueues([new BullAdapter(taskQueue)]);

// Add Bull Board route to the app
app.use('/admin/queues', router);

// Start server
app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});
