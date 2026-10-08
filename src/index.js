const express = require('express');
const http = require('http');
const rateLimiter = require('./middleware/rateLimiter');
const createCircuitBreaker = require('./utils/circuitBreaker');

const app = express();
const PORT = process.env.PORT || 3000;

const serviceAInstances = [
  { host: 'localhost', port: 5001 },
  { host: 'localhost', port: 5002 },
];

let currentInstanceIndex = 0;

const getNextInstance = () => {
  const target = serviceAInstances[currentInstanceIndex];
  currentInstanceIndex = (currentInstanceIndex + 1) % serviceAInstances.length;
  return target;
};

// Función de envío de petición envuelta por el Circuit Breaker
const forwardRequest = (target) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: target.host,
      port: target.port,
      path: '/data',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 500) {
          reject(new Error(`Server error: ${res.statusCode}`));
        } else {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
};

const breaker = createCircuitBreaker(forwardRequest);

app.use(express.json());
app.use(rateLimiter);

app.get('/api/v1/service-a', async (req, res) => {
  const target = getNextInstance();
  console.log(`[API Gateway] Forwarding request to: http://${target.host}:${target.port}/data`);

  try {
    const result = await breaker.fire(target);
    if (result.error) {
      return res.status(503).json(result);
    }
    res.status(result.statusCode).json(result.data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Gateway Error', message: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is healthy' });
});

app.listen(PORT, () => {
  console.log(`🚀 Distributed API Gateway running on port ${PORT}`);
});
