const Bull = require('bull');
const redis = require('redis');
const moment = require('moment-timezone');
const { addToLibrary } = require('../services/spotifyService');

// Create a queue for task scheduling
const taskQueue = new Bull('taskQueue', {
    redis: {
        host: 'localhost', // or your Redis server details
        port: 6379,
    },
});

// Process the jobs from the queue
taskQueue.process(async (job) => {
    const { userId, songLink, accessToken, libraryId } = job.data;

    try {
        const success = await addToLibrary(accessToken, songLink, libraryId);
        if (success) {
            console.log(`Successfully added song ${songLink} to user ${userId}'s library`);
        } else {
            console.error(`Failed to add song ${songLink} to user ${userId}'s library.`);
        }
    } catch (error) {
        console.error(`Error adding song for user ${userId}:`, error.message);
    }
});

// Function to schedule a task for a user
const scheduleTask = ({ userReleaseTime, userId, songLink, accessToken, timeZone, libraryId }) => {
    // Convert the release date to the user's time zone and get the cron time format
    const userTime = moment.tz(userReleaseTime, timeZone);

    // Calculate the delay (in milliseconds) until the user release time
    const delay = userTime.diff(moment());

    // Add the job to the queue with a delay
    taskQueue.add(
        { userId, songLink, accessToken, libraryId },
        { delay } // Delay the job execution to the user's release time
    );

    console.log(`Task scheduled for user ${userId} at ${userTime.format()} (${timeZone}).`);
};

module.exports = { scheduleTask, taskQueue };
