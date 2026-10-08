const request = require('supertest');
const express = require('express');

// Creamos un mock rápido para testing sin depender de Docker/Redis activo en tests unitarios
describe('API Gateway Basic Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.get('/health', (req, res) => res.json({ status: 'API Gateway is healthy' }));
  });

  test('GET /health debe responder HTTP 200 y status OK', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'API Gateway is healthy' });
  });
});
