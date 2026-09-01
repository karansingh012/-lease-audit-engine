const fs = require('fs');
const { RocketRideClient } = require('rocketride');

async function deployToLocal() {
  const uri = 'http://localhost:55023';
  const apiKey = process.env.ROCKETRIDE_APIKEY;
  if (!apiKey) throw new Error('ROCKETRIDE_APIKEY is not set');
  const pipeData = fs.readFileSync('lease_audit.pipe', 'utf8');
  const pipeline = JSON.parse(pipeData);

  try {
    const client = new RocketRideClient({ auth: apiKey, uri: uri, persist: false });
    await client.connect();
    console.log("Connected to engine!");
    
    console.log("Deploying pipeline...");
    const result = await client.deploy.add(pipeline);
    console.log("Deployment Result:", JSON.stringify(result, null, 2));
    
    await client.disconnect();
  } catch (err) {
    console.error("Failed:", err);
  }
}

deployToLocal();
