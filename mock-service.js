const http = require('http');

const port = process.env.PORT || 5001;
const serviceName = process.env.SERVICE_NAME || 'Service-A';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    instance: serviceName,
    timestamp: new Date().toISOString()
  }));
});

server.listen(port, () => {
  console.log(`${serviceName} running on port ${port}`);
});
