const cron = require("node-cron");
const moment = require("moment-timezone");
const { addSongToLibrary } = require("../services/spotifyService");

// Function to schedule task based on user timezone
const scheduleTask = (userReleaseTime, userId, songLink, accessToken, timeZone) => {
    // Convert the release date to the specified user's time zone
    const userTime = moment.tz(userReleaseTime, timeZone).format("YYYY-MM-DD HH:mm");

    // Schedule the song to be added to the library at the user's release time (converted to correct time zone)
    cron.schedule(userTime, async () => {
        const success = await addSongToLibrary(accessToken, songLink);
        if (success) {
            console.log(`Successfully added song ${songLink} to user ${userId}'s library`);
        } else {
            console.error("Failed to add song to library.");
        }
    }, {
        scheduled: true,
        timezone: timeZone // Specify the timezone for this cron job
    });
};

module.exports = { scheduleTask };
