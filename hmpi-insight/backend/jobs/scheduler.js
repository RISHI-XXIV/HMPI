const cron = require('node-cron');

function startScheduledJobs() {
  // Scheduled job for checking contamination thresholds
  cron.schedule('0 * * * *', () => {
    console.log('Running hourly contamination check...');
    // Implementation to be added
  });

  console.log('Scheduled jobs started');
}

module.exports = { startScheduledJobs };
