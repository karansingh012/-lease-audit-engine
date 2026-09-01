const fs = require('fs');
const { RocketRideClient } = require('rocketride');

async function deploy() {
  const apiKey = process.env.ROCKETRIDE_APIKEY;
  if (!apiKey) {
    console.error("No ROCKETRIDE_APIKEY found");
    process.exit(1);
  }

  const pipeData = fs.readFileSync('lease_audit.pipe', 'utf8');
  const pipeline = JSON.parse(pipeData);

  try {
    await RocketRideClient.withConnection(
      { auth: apiKey, uri: process.env.ROCKETRIDE_URI || 'https://api.rocketride.ai' },
      async (client) => {
        console.log("Connected to RocketRide Cloud. Starting pipeline...");
        const result = await client.use({ pipeline, useExisting: false });
        console.log(JSON.stringify(result, null, 2));
      }
    );
  } catch (err) {
    console.error("Deployment failed:", err);
  }
}

deploy();
