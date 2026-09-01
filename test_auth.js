const { RocketRideClient } = require('rocketride');

async function test() {
  const client = new RocketRideClient({ 
    auth: process.env.ROCKETRIDE_APIKEY,
    uri: process.env.ROCKETRIDE_URI || 'https://api.rocketride.ai',
    persist: false
  });
  try {
    await client.connect();
    console.log("Connected!", client.getAccountInfo());
    const deps = await client.deploy.list();
    console.log("Deployments:", deps);
  } catch(e) {
    console.error("Auth error:", e);
  } finally {
    await client.disconnect();
  }
}
test();
