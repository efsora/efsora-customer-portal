/**
 * AI Service Configuration
 *
 * Configuration for communicating with the AI service (FastAPI).
 */

import { env } from "#infrastructure/config/env";

export const AI_SERVICE_CONFIG = {
  baseURL: env.AI_SERVICE_URL || "http://localhost:8000",
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
    // Add API key header if needed in the future
    // "X-API-Key": env.AI_SERVICE_API_KEY,
  },
} as const;

/**
 * AI Service Endpoints
 * All endpoint paths are centralized here for maintainability
 */
export const AI_SERVICE_ENDPOINTS = {
  hello: "/api/v1/hello",
  users: "/api/v1/users",
  embedText: "/api/v1/weaviate/embed",
  search: "/api/v1/weaviate/search",
  chatStream: "/api/v1/chat/stream",
  embedDocument: "/api/v1/weaviate/embed-document",
} as const;
