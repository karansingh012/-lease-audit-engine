const { RocketRideClient } = require('rocketride');

async function probe() {
  try {
    console.log("Probing RocketRide Cloud at api.rocketride.ai...");
    const info = await RocketRideClient.getServerInfo('https://api.rocketride.ai', 15000);
    console.log("Server Info:", JSON.stringify(info, null, 2));
  } catch (err) {
    console.error("Probe failed:", err.message || err);
    if (err.dapResult) {
      console.error("DAP Result:", JSON.stringify(err.dapResult, null, 2));
    }
  }
}

probe();
