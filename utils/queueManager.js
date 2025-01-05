const { taskQueue } = require('./taskQueue');

// Monitor the queue status
const monitorQueue = () => {
    taskQueue.on('completed', (job, result) => {
        console.log(`Job ${job.id} completed successfully.`);
    });

    taskQueue.on('failed', (job, err) => {
        console.error(`Job ${job.id} failed with error: ${err.message}`);
    });

    taskQueue.on('stalled', (job) => {
        console.warn(`Job ${job.id} is stalled.`);
    });
};

module.exports = { monitorQueue };
