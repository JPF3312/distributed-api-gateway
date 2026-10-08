# Distributed API Gateway & Resilience Engine

An enterprise-ready, high-availability Distributed API Gateway built with Node.js, Express, Redis, Docker, and Circuit Breaker patterns. Designed for horizontal scalability, rate-limiting protection, and graceful service degradation under system failures.

## 🏗 Architecture Overview

```text
               +----------------------------------+
               |           Client / App           |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |     API Gateway (Node.js)        |
               +----------------------------------+
                 /              |               \
                /               v                \
  +------------------+  +---------------+  +------------------+
  | Redis Limiter    |  | Round-Robin   |  | Circuit Breaker  |
  | (ioredis / 6379) |  | Load Balancer |  | (Opossum Engine) |
  +------------------+  +---------------+  +------------------+
                                |
                  +-------------+-------------+
                  |                           |
                  v                           v
        +-------------------+       +-------------------+
        | Service-A (A1)    |       | Service-A (A2)    |
        | Port 5001         |       | Port 5002         |
        +-------------------+       +-------------------+
