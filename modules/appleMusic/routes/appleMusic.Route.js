// Import necessary controllers from your path
const { loginController, addToAppleMusic } = require('../controllers/appleMusic.Controller'); 

const express = require('express');
const router = express.Router();  // Create a router instance

// Define your routes
router.get('/login', loginController); //  login it a redirect 
router.post('/add-song', addToAppleMusic); // Add song to library or playlist 

// Export the router
module.exports = router;
