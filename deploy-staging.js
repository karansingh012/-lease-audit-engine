const fs = require('fs');
const { RocketRideClient } = require('rocketride');

async function deployStagingPipeline() {
  const apiKey = process.env.ROCKETRIDE_APIKEY;
  if (!apiKey) {
    console.error("No ROCKETRIDE_APIKEY found");
    process.exit(1);
  }

  const pipeData = fs.readFileSync('lease_audit-staging.pipe', 'utf8');
  const pipeline = JSON.parse(pipeData);

  try {
    await RocketRideClient.withConnection(
      { auth: apiKey, uri: process.env.ROCKETRIDE_URI || 'https://api.rocketride.ai' },
      async (client) => {
        console.log("Connected to RocketRide Cloud. Deploying staging pipeline...");
        const result = await client.use({ pipeline, useExisting: false });
        console.log("\n✅ Staging Pipeline Deployed Successfully!");
        console.log("\nStaging Pipeline Details:");
        console.log("  Task ID:", result.id);
        console.log("  Token:", result.token);
        console.log("  Public Token:", result.publicToken);
        console.log("\n📊 Dashboard: https://cloud.rocketride.ai");
        console.log("🔗 RocketRide Webhook URL: " + (process.env.ROCKETRIDE_URI || 'https://api.rocketride.ai'));
      }
    );
  } catch (err) {
    console.error("Deployment failed:", err);
    process.exit(1);
  }
}

deployStagingPipeline();
