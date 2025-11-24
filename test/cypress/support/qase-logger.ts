/**
 * Qase Logger Utility
 * Provides structured logging for Qase test case integration debugging
 */

enum LogLevel {
  DEBUG = '🔍',
  INFO = 'ℹ️',
  SUCCESS = '✅',
  WARN = '⚠️',
  ERROR = '❌',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: Record<string, any>;
}

class QaseLogger {
  private logs: LogEntry[] = [];
  private isEnabled = true;

  log(level: LogLevel, component: string, message: string, data?: Record<string, any>) {
    if (!this.isEnabled) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
    };

    this.logs.push(entry);

    const dataStr = data ? `\n      ${JSON.stringify(data, null, 2)}` : '';
    console.log(`${level} [${component}] ${message}${dataStr}`);
  }

  debug(component: string, message: string, data?: Record<string, any>) {
    this.log(LogLevel.DEBUG, component, message, data);
  }

  info(component: string, message: string, data?: Record<string, any>) {
    this.log(LogLevel.INFO, component, message, data);
  }

  success(component: string, message: string, data?: Record<string, any>) {
    this.log(LogLevel.SUCCESS, component, message, data);
  }

  warn(component: string, message: string, data?: Record<string, any>) {
    this.log(LogLevel.WARN, component, message, data);
  }

  error(component: string, message: string, data?: Record<string, any>) {
    this.log(LogLevel.ERROR, component, message, data);
  }

  /**
   * Track test discovery
   */
  trackTestDiscovery(specFile: string, testCount: number, testIds: number[]) {
    this.info('TEST_DISCOVERY', `Found ${testCount} tests in ${specFile}`, {
      spec: specFile,
      testCount,
      testIds,
    });
  }

  /**
   * Track metadata collection
   */
  trackMetadataCollection(testId: number, testTitle: string) {
    this.debug('METADATA_COLLECTION', `Collecting metadata for test case #${testId}`, {
      testId,
      testTitle,
    });
  }

  /**
   * Track test execution
   */
  trackTestExecution(testId: number, testTitle: string, status: 'passed' | 'failed') {
    this.info('TEST_EXECUTION', `Test #${testId} ${status}`, {
      testId,
      testTitle,
      status,
    });
  }

  /**
   * Track result submission
   */
  trackResultSubmission(testId: number, status: string, duration: number) {
    this.debug('RESULT_SUBMISSION', `Submitting result for test #${testId}`, {
      testId,
      status,
      duration,
    });
  }

  /**
   * Track Qase API calls
   */
  trackQaseApiCall(method: string, endpoint: string, statusCode?: number, data?: any) {
    const level = statusCode && statusCode >= 400 ? LogLevel.ERROR : LogLevel.SUCCESS;
    this.log(level, 'QASE_API', `${method} ${endpoint} (${statusCode || 'pending'})`, data);
  }

  /**
   * Get all logs
   */
  getAllLogs(): LogEntry[] {
    return this.logs;
  }

  /**
   * Get logs filtered by component
   */
  getLogsByComponent(component: string): LogEntry[] {
    return this.logs.filter((log) => log.component === component);
  }

  /**
   * Export logs to JSON
   */
  exportToJson(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Print logs summary
   */
  printSummary() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 Qase Integration Logs Summary');
    console.log('═══════════════════════════════════════════════════════════');

    const components = [...new Set(this.logs.map((log) => log.component))];
    for (const component of components) {
      const componentLogs = this.getLogsByComponent(component);
      console.log(`\n${component}: ${componentLogs.length} entries`);

      const errors = componentLogs.filter((log) => log.level === LogLevel.ERROR);
      if (errors.length > 0) {
        console.log('  Errors:');
        errors.forEach((log) => {
          console.log(`    - ${log.message}`);
          if (log.data) console.log(`      ${JSON.stringify(log.data)}`);
        });
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
  }
}

// Create singleton instance
export const qaseLogger = new QaseLogger();

// Make it available globally for Cypress hooks
(window as any).qaseLogger = qaseLogger;
