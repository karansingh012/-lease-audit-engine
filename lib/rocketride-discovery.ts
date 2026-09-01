import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { RocketRideClient } from 'rocketride';

export interface RocketRideEndpoint {
  uri: string;
  webhookUrl: string;
  port: number;
  source: 'env' | 'discovered-pid' | 'discovered-process' | 'default';
}

/**
 * Probes a server port using the RocketRide SDK to verify an active RocketRide engine.
 */
async function probeServer(hostname: string, port: number, timeoutMs = 1200): Promise<boolean> {
  try {
    const info = await RocketRideClient.getServerInfo(`${hostname}:${port}`, timeoutMs);
    return !!(info && info.capabilities);
  } catch {
    return false;
  }
}

/**
 * Discovers the active local RocketRide engine endpoint.
 * When the VS Code extension runs with dynamic ports (--port=0),
 * it writes engine-<PID>.pid into the RocketRide engine directory.
 * This function locates active engine PIDs, finds their listening port,
 * and validates the endpoint using the RocketRide SDK.
 */
export async function discoverActiveRocketRideEndpoint(): Promise<RocketRideEndpoint | null> {
  // 1. Check if user configured an explicit webhook URL in environment and test if reachable
  const envWebhook = process.env.ROCKETRIDE_WEBHOOK_URL;
  if (envWebhook) {
    try {
      const url = new URL(envWebhook);
      const port = parseInt(url.port || (url.protocol === 'https:' ? '443' : '80'), 10);
      const isAlive = await probeServer(url.hostname, port);
      if (isAlive) {
        const uri = `${url.protocol}//${url.host}`;
        return {
          uri,
          webhookUrl: envWebhook,
          port,
          source: 'env'
        };
      }
      console.warn(`[RocketRide Discovery] Configured ROCKETRIDE_WEBHOOK_URL (${envWebhook}) is not reachable. Falling back to auto-discovery.`);
    } catch {
      // Invalid URL, continue
    }
  }

  // 2. Check if user configured an explicit URI
  const envUri = process.env.ROCKETRIDE_URI;
  if (envUri) {
    try {
      const url = new URL(envUri);
      const port = parseInt(url.port || (url.protocol === 'https:' ? '443' : '80'), 10);
      const isAlive = await probeServer(url.hostname, port);
      if (isAlive) {
        const cleanUri = `${url.protocol}//${url.host}`;
        return {
          uri: cleanUri,
          webhookUrl: `${cleanUri}/webhook`,
          port,
          source: 'env'
        };
      }
      console.warn(`[RocketRide Discovery] Configured ROCKETRIDE_URI (${envUri}) is not reachable. Falling back to auto-discovery.`);
    } catch {
      // Invalid URI, continue
    }
  }

  // 3. Auto-discovery from RocketRide Engine directory (PID files written by VS Code extension)
  const candidateDirs = [
    path.join(os.homedir(), 'Library/Application Support/RocketRide/engine'),
    path.join(os.homedir(), '.local/share/RocketRide/engine'),
    path.join(process.env.APPDATA || '', 'RocketRide/engine')
  ];

  const candidatePids: number[] = [];

  for (const dir of candidateDirs) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ dir)) {
        const files = fs.readdirSync(/*turbopackIgnore: true*/ dir);
        for (const file of files) {
          if (file.startsWith('engine-') && file.endsWith('.pid')) {
            const content = fs.readFileSync(/*turbopackIgnore: true*/ path.join(dir, file), 'utf8').trim();
            const pid = parseInt(content, 10);
            if (!isNaN(pid)) {
              try {
                process.kill(pid, 0); // Check if process is currently running
                candidatePids.push(pid);
              } catch {
                // Stale pid file, ignore
              }
            }
          }
        }
      }
    } catch {
      // Directory not accessible, ignore
    }
  }

  // 4. Process inspection fallback (pgrep for eaas.py)
  if (candidatePids.length === 0) {
    try {
      const pgrepOut = execSync('pgrep -f eaas.py', { encoding: 'utf8' });
      const pids = pgrepOut
        .trim()
        .split('\n')
        .map(p => parseInt(p.trim(), 10))
        .filter(p => !isNaN(p));
      for (const p of pids) {
        try {
          process.kill(p, 0);
          candidatePids.push(p);
        } catch {}
      }
    } catch {
      // pgrep failed or not found, ignore
    }
  }

  // 5. Inspect listening ports for discovered PIDs using lsof
  for (const pid of candidatePids) {
    try {
      const lsofOut = execSync(`lsof -Pan -p ${pid} -iTCP -sTCP:LISTEN -F n`, { encoding: 'utf8' });
      const matches = lsofOut.match(/n.*:(\d+)/g);
      if (matches) {
        for (const m of matches) {
          const portStr = m.replace(/.*:/, '').trim();
          const port = parseInt(portStr, 10);
          if (!isNaN(port)) {
            const isAlive = await probeServer('localhost', port);
            if (isAlive) {
              console.log(`[RocketRide Discovery] Discovered active engine on port ${port} (PID ${pid})`);
              return {
                uri: `http://localhost:${port}`,
                webhookUrl: `http://localhost:${port}/webhook`,
                port,
                source: 'discovered-pid'
              };
            }
          }
        }
      }
    } catch {
      // lsof failed for this pid, continue
    }
  }

  // 6. Final fallback: probe standard RocketRide default port 5565
  try {
    const isAlive = await probeServer('localhost', 5565);
    if (isAlive) {
      console.log(`[RocketRide Discovery] Found active RocketRide engine on default port 5565`);
      return {
        uri: 'http://localhost:5565',
        webhookUrl: 'http://localhost:5565/webhook',
        port: 5565,
        source: 'default'
      };
    }
  } catch {}

  return null;
}
