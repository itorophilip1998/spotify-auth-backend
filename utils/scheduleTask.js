const cron = require("node-cron");
const moment = require("moment-timezone");
const { addToLibrary } = require("../services/spotifyService");

// Function to schedule task based on user timezone
const scheduleTask = ({ userReleaseTime, userId, songLink, accessToken, timeZone,libraryId }) => {
    // Convert the release date to the user's time zone and get the cron time format
    const userTime = moment.tz(userReleaseTime, timeZone);
    const cronTime = userTime.format("m H D M *"); // 'MM HH DD MM ddd'
   
    // Schedule the song to be added to the library at the user's release time (converted to correct time zone)
    cron.schedule(
        cronTime,
        async () => {
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
        },
        {
            scheduled: true,
            timezone: timeZone, // Specify the timezone for this cron job
        }
    );

    console.log(`Task scheduled for ${userTime} (${timeZone}).`);
};

module.exports = { scheduleTask };
