/**
 * Health Check API Tests
 * Tests the backend service health endpoint
 */
import { HealthService } from '../../api/HealthService';
import { qase } from 'cypress-qase-reporter/mocha';

describe('API > Health Check API Tests', () => {
  let healthService: HealthService;

  before(() => {
    healthService = new HealthService();
  });

  describe('GET /health', () => {
    qase(40, it('should return healthy status', () => {
      healthService.getHealth().then((response) => {
        healthService.verifyHealthy(response);
        healthService.logResponse(response, 'Health Check');
      });
    }));

    qase(41, it('should include timestamp in response', () => {
      healthService.getHealth().then((response) => {
        healthService.verifyHealthy(response);
        healthService.verifyHasTimestamp(response);
      });
    }));

    qase(42, it('should respond within acceptable time', () => {
      healthService.getHealth().then((response) => {
        healthService.verifyHealthy(response);
        healthService.verifyHealthResponseTime(response, 1000); // 1 second max
      });
    }));

    qase(43, it('should have proper response structure', () => {
      healthService.getHealth().then((response) => {
        healthService.verifyStatus(response, 200);

        // Verify response body structure
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('status');
        expect(response.body).to.have.property('timestamp');
        expect(response.body).to.have.property('message');

        expect(response.body.status).to.be.a('string');
        expect(response.body.timestamp).to.be.a('string');
        expect(response.body.message).to.be.a('string');

        // Verify status is 'ok'
        expect(response.body.status).to.equal('ok');
      });
    }));

    qase(44, it('should return consistent status', () => {
      // Call health endpoint multiple times
      cy.wrap(null).then(() => {
        return healthService.getHealth();
      }).then((response1) => {
        healthService.verifyHealthy(response1);

        // Wait a bit and call again
        cy.wait(100);
        return healthService.getHealth();
      }).then((response2) => {
        healthService.verifyHealthy(response2);
      });
    }));
  });
});
