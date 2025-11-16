/**
 * Qase Result Submitter
 * Handles submitting test results to Qase with proper run_id
 * Workaround for cypress-qase-reporter v3.1.0 run_id null bug
 */

const QASE_API_URL = 'https://api.qase.io/v1';

/**
 * Submit test result to Qase
 */
async function submitTestResult(token, projectCode, runId, testResult) {
  try {
    const response = await fetch(
      `${QASE_API_URL}/result/${projectCode}`,
      {
        method: 'POST',
        headers: {
          'Token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testResult,
          run_id: runId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[ERROR] Failed to submit result: ${error.message}`);
    return null;
  }
}

/**
 * Get test run by title (to find the run_id)
 */
async function getTestRun(token, projectCode, title) {
  try {
    const response = await fetch(
      `${QASE_API_URL}/run/${projectCode}?limit=100&offset=0`,
      {
        method: 'GET',
        headers: {
          'Token': token,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    // Find most recent run that matches the title pattern
    const run = data.result.entities.find(r => r.title.includes(title));
    return run;
  } catch (error) {
    console.error(`[ERROR] Failed to get test run: ${error.message}`);
    return null;
  }
}

module.exports = {
  submitTestResult,
  getTestRun,
};
