/**
 * AI Service HTTP Client
 *
 * Type-safe HTTP client for communicating with the AI service (FastAPI).
 * Uses generated types from OpenAPI spec for full type safety.
 */

/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { paths, components } from "#generated/ai-service";
import { logger } from "#infrastructure/logger";
import { AI_SERVICE_CONFIG, AI_SERVICE_ENDPOINTS } from "./config.js";

/**
 * Type-safe response type from AI service
 */
export type AIServiceResponse<T> = {
  success: boolean;
  data?: T | null;
  message?: string | null;
  meta?: components["schemas"]["Meta"] | null;
  error?: components["schemas"]["ErrorInfo"] | null;
  trace_id?: string | null;
};

/**
 * AI Service Client
 * Provides type-safe methods for calling AI service endpoints
 */
export class AIServiceClient {
  private client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL ?? AI_SERVICE_CONFIG.baseURL,
      timeout: AI_SERVICE_CONFIG.timeout,
      headers: AI_SERVICE_CONFIG.headers,
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(
          {
            method: config.method,
            url: config.url,
            baseURL: config.baseURL,
          },
          "AI Service request",
        );
        return config;
      },
      (error) => {
        logger.error({ error }, "AI Service request error");
        return Promise.reject(error);
      },
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(
          {
            status: response.status,
            url: response.config.url,
            traceId: response.data?.trace_id,
          },
          "AI Service response",
        );
        return response;
      },
      (error) => {
        logger.error(
          {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data,
          },
          "AI Service response error",
        );
        return Promise.reject(error);
      },
    );
  }

  /**
   * Health check endpoint
   */
  async hello(): Promise<
    AIServiceResponse<components["schemas"]["HelloResponse"]>
  > {
    const response = await this.client.get<
      paths["/api/v1/hello"]["get"]["responses"][200]["content"]["application/json"]
    >(AI_SERVICE_ENDPOINTS.hello);
    return response.data;
  }

  /**
   * Create user in AI service
   */
  async createUser(
    data: components["schemas"]["CreateUserRequest"],
  ): Promise<AIServiceResponse<components["schemas"]["CreateUserResponse"]>> {
    const response = await this.client.post<
      paths["/api/v1/users"]["post"]["responses"][201]["content"]["application/json"]
    >(AI_SERVICE_ENDPOINTS.users, data);
    return response.data;
  }

  /**
   * Embed text into Weaviate
   */
  async embedText(
    data: components["schemas"]["EmbedRequest"],
  ): Promise<AIServiceResponse<components["schemas"]["EmbedResponse"]>> {
    const response = await this.client.post<
      paths["/api/v1/weaviate/embed"]["post"]["responses"][201]["content"]["application/json"]
    >(AI_SERVICE_ENDPOINTS.embedText, data);
    return response.data;
  }

  /**
   * Search Weaviate
   */
  async search(
    data: components["schemas"]["SearchRequest"],
  ): Promise<AIServiceResponse<components["schemas"]["SearchResponse"]>> {
    const response = await this.client.post<
      paths["/api/v1/weaviate/search"]["post"]["responses"][200]["content"]["application/json"]
    >(AI_SERVICE_ENDPOINTS.search, data);
    return response.data;
  }

  /**
   * Stream chat response from AI service via SSE
   * Note: Uses native fetch instead of Axios for SSE streaming support
   * Includes basic retry logic for transient failures
   */
  async *streamChat(
    message: string,
    sessionId: string,
    retryCount = 0,
  ): AsyncGenerator<string, void, unknown> {
    const baseURL = this.client.defaults.baseURL ?? AI_SERVICE_CONFIG.baseURL;
    const url = `${baseURL}${AI_SERVICE_ENDPOINTS.chatStream}`;
    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 1000;

    logger.debug(
      { url, sessionId, messageLength: message.length, retryCount },
      "Streaming chat from AI service",
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
        }),
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (!response.ok) {
        const status = String(response.status);
        const error = `AI Service stream error: ${status}`;
        logger.error({ status: response.status, url, retryCount }, error);

        // Retry on 5xx errors
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          logger.info(
            { retryCount: retryCount + 1 },
            "Retrying AI service request",
          );
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)),
          );
          yield* this.streamChat(message, sessionId, retryCount + 1);
          return;
        }

        throw new Error(error);
      }

      if (!response.body) {
        throw new Error("No response body from AI service");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; // Buffer for incomplete lines

      try {
        // Stream reading loop - breaks when stream is complete (done === true)
        // This is the standard pattern for ReadableStream consumption
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
          const result = await reader.read();

          // Stream complete - exit loop
          if (result.done) {
            break;
          }

          // Type assertion is safe - value is Uint8Array when done === false
          const chunk = decoder.decode(result.value as Uint8Array, {
            stream: true,
          });

          // Add to buffer and process complete SSE messages
          buffer += chunk;

          // SSE messages end with \n\n - split on that boundary
          const messages = buffer.split("\n\n");

          // Keep the last incomplete message in buffer
          buffer = messages.pop() ?? "";

          // Process complete messages
          for (const message of messages) {
            const lines = message.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                // Don't trim - preserve intentional spacing from Bedrock
                const data = line.slice(6);
                if (data && !data.startsWith("[Error]")) {
                  yield data;
                } else if (data.startsWith("[Error]")) {
                  logger.error(
                    { sessionId, error: data },
                    "AI service returned error",
                  );
                  throw new Error(data.slice(8));
                }
              }
            }
          }
        }

        logger.debug({ sessionId }, "Chat stream completed successfully");
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "TimeoutError" &&
        retryCount < MAX_RETRIES
      ) {
        logger.warn(
          { retryCount: retryCount + 1 },
          "AI service timeout, retrying",
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)),
        );
        yield* this.streamChat(message, sessionId, retryCount + 1);
        return;
      }
      throw error;
    }
  }

  /**
   * Stream document embedding progress from AI service via SSE
   * Note: Uses native fetch instead of Axios for SSE streaming support
   * Includes basic retry logic for transient failures
   */
  async *streamEmbedDocument(
    s3Key: string,
    projectId: string,
    collectionName?: string | null,
    retryCount = 0,
  ): AsyncGenerator<string, void, unknown> {
    const baseURL = this.client.defaults.baseURL ?? AI_SERVICE_CONFIG.baseURL;
    const url = `${baseURL}${AI_SERVICE_ENDPOINTS.embedDocument}`;
    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 1000;
    const TIMEOUT_MS = 120000; // 2 minutes for document processing

    logger.debug(
      { url, s3Key, projectId, collectionName, retryCount },
      "Streaming document embedding from AI service",
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          s3_key: s3Key,
          project_id: projectId,
          collection_name: collectionName ?? null,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        const status = String(response.status);
        const errorText = await response.text();
        const error = `AI Service embed-document error: ${status}`;
        logger.error(
          { status: response.status, url, retryCount, errorText, s3Key },
          error,
        );

        // Retry on 5xx errors
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          logger.info(
            { retryCount: retryCount + 1 },
            "Retrying AI service embed-document request",
          );
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)),
          );
          yield* this.streamEmbedDocument(
            s3Key,
            projectId,
            collectionName,
            retryCount + 1,
          );
          return;
        }

        throw new Error(error);
      }

      if (!response.body) {
        throw new Error("No response body from AI service");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        // Stream reading loop - breaks when stream is complete (done === true)
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
          const result = await reader.read();

          if (result.done) {
            break;
          }

          // Type assertion is safe - value is Uint8Array when done === false
          const chunk = decoder.decode(result.value as Uint8Array, {
            stream: true,
          });

          // Forward raw chunk - SSE formatting is preserved
          yield chunk;
        }

        logger.debug(
          { s3Key },
          "Document embedding stream completed successfully",
        );
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "TimeoutError" &&
        retryCount < MAX_RETRIES
      ) {
        logger.warn(
          { retryCount: retryCount + 1, s3Key },
          "AI service embed-document timeout, retrying",
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)),
        );
        yield* this.streamEmbedDocument(
          s3Key,
          projectId,
          collectionName,
          retryCount + 1,
        );
        return;
      }
      throw error;
    }
  }

  /**
   * Generic request method for custom requests
   */
  async request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }
}

/**
 * Singleton instance of AI Service Client
 */
export const aiServiceClient = new AIServiceClient();

/**
 * Factory function for creating AI Service Client with custom config
 */
export function createAIServiceClient(baseURL?: string): AIServiceClient {
  return new AIServiceClient(baseURL);
}
