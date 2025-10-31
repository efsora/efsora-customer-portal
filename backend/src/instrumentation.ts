/**
 * OpenTelemetry Instrumentation Bootstrap
 *
 * This file MUST be loaded BEFORE any application code (via --import flag)
 * to ensure auto-instrumentation patches modules before they are imported.
 *
 * With ES modules, instrumentation MUST run before express/http are loaded.
 * This file is imported via Node.js --import flag in package.json scripts.
 */

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

console.log("[INSTRUMENTATION] Loading instrumentation BEFORE app code...");

// Check environment
const ENABLE_TRACING = process.env.ENABLE_TRACING === "true";
const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || "backend-api";
const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (!ENABLE_TRACING) {
  console.log("[INSTRUMENTATION] Tracing disabled - skipping SDK initialization");
} else {
  // Configure HTTP and Express instrumentations with debug hooks
  const httpInstrumentation = new HttpInstrumentation({
    enabled: true,
    requestHook: (span, _request) => {
      const spanContext = span.spanContext();
      console.log("[HTTP Instrumentation] HTTP span created:", {
        spanId: spanContext.spanId,
        traceId: spanContext.traceId,
      });
    },
  });

  const expressInstrumentation = new ExpressInstrumentation({
    enabled: true,
    requestHook: (span, _request) => {
      const spanContext = span.spanContext();
      console.log("[Express Instrumentation] Express span created:", {
        spanId: spanContext.spanId,
        traceId: spanContext.traceId,
      });
    },
  });

  // Choose exporter based on configuration
  const traceExporter = OTEL_EXPORTER_OTLP_ENDPOINT
    ? new OTLPTraceExporter({ url: OTEL_EXPORTER_OTLP_ENDPOINT })
    : new ConsoleSpanExporter();

  console.log(
    `[INSTRUMENTATION] Initializing with ${OTEL_EXPORTER_OTLP_ENDPOINT ? `OTLP exporter (${OTEL_EXPORTER_OTLP_ENDPOINT})` : "Console exporter"}`,
  );

  // Initialize SDK
  const sdk = new NodeSDK({
    instrumentations: [
      httpInstrumentation,
      expressInstrumentation,
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-express": {
          enabled: false, // Using explicit config above
        },
        "@opentelemetry/instrumentation-fs": {
          enabled: false, // Too noisy
        },
        "@opentelemetry/instrumentation-http": {
          enabled: false, // Using explicit config above
        },
      }),
    ],
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: OTEL_SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: "1.0.0",
    }),
    traceExporter,
  });

  console.log("[INSTRUMENTATION] Starting OpenTelemetry SDK...");
  sdk.start();
  console.log("[INSTRUMENTATION] OpenTelemetry SDK started - HTTP/Express modules are now instrumented");

  // Handle graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("[INSTRUMENTATION] Shutting down OpenTelemetry SDK...");
    await sdk.shutdown();
    console.log("[INSTRUMENTATION] OpenTelemetry SDK shut down successfully");
  });
}
