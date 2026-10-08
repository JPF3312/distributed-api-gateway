const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000
};

const createCircuitBreaker = (requestFunction) => {
  const breaker = new CircuitBreaker(requestFunction, options);

  breaker.on('open', () => console.warn('⚠️ [Circuit Breaker] OPEN: Instancia inestable, bloqueando peticiones.'));
  breaker.on('halfOpen', () => console.log('🔄 [Circuit Breaker] HALF-OPEN: Probando salud de la instancia...'));
  breaker.on('close', () => console.log('✅ [Circuit Breaker] CLOSED: Servicio recuperado y funcionando.'));

  breaker.fallback(() => ({
    error: 'Service Unavailable',
    message: 'El servicio destino no responde adecuadamente. Intente más tarde.'
  }));

  return breaker;
};

module.exports = createCircuitBreaker;
