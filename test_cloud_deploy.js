const fs = require('fs');
const { RocketRideClient } = require('rocketride');

async function deployToCloud() {
  const uri = process.env.ROCKETRIDE_URI || 'https://api.rocketride.ai';
  const apiKey = process.env.ROCKETRIDE_APIKEY;
  if (!apiKey) throw new Error('ROCKETRIDE_APIKEY is not set');
  const pipeData = fs.readFileSync('lease_audit.pipe', 'utf8');
  const pipeline = JSON.parse(pipeData);

  try {
    const client = new RocketRideClient({ 
      auth: apiKey, 
      uri: uri, 
      persist: false,
      project_id: pipeline.project_id 
    });
    await client.connect();
    console.log("Connected to cloud engine!");
    
    console.log("Deploying pipeline...");
    const result = await client.deploy.add(pipeline);
    console.log("Deployment Result:", JSON.stringify(result, null, 2));
    
    await client.disconnect();
  } catch (err) {
    console.error("Failed:", err);
  }
}

deployToCloud();
