const { RocketRideClient, AuthenticationException } = require('rocketride');

async function testCloudAuth() {
  const apiKey = process.env.ROCKETRIDE_APIKEY;
  const uri = process.env.ROCKETRIDE_URI || 'https://api.rocketride.ai';
  if (!apiKey) throw new Error('ROCKETRIDE_APIKEY is not set');
  
  console.log(`URI: ${uri}`);
  
  const client = new RocketRideClient({ 
    uri,
    persist: false,
    onTrace: (msg) => console.log('[TRACE]', msg),
  });

  try {
    // Step 1: Just attach (no auth)
    console.log('\n--- Step 1: Attach (WebSocket only) ---');
    await client.attach();
    console.log('Attached successfully. isAttached:', client.isAttached());

    // Step 2: Try login  
    console.log('\n--- Step 2: Login ---');
    const result = await client.login(apiKey);
    console.log('Login successful!');
    console.log('Account Info:', JSON.stringify(result, null, 2));
    
    // Step 3: List deployments
    console.log('\n--- Step 3: List deployments ---');
    const deployments = await client.deploy.list();
    console.log('Deployments:', JSON.stringify(deployments, null, 2));
    
    await client.disconnect();
  } catch (err) {
    console.error('\nAuth failed:', err.message);
    if (err instanceof AuthenticationException) {
      console.error('AuthenticationException details:');
      console.error('  dapResult:', JSON.stringify(err.dapResult, null, 2));
    }
    if (err.dapResult) {
      console.error('DAP Result:', JSON.stringify(err.dapResult, null, 2));
    }
    try { await client.disconnect(); } catch {}
  }
}

testCloudAuth();
