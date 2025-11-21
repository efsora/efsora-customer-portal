/**
 * Authentication API Tests
 * Tests the backend authentication endpoints (register, login, logout, etc.)
 */
import { AuthService } from '../../api/AuthService';
import { generateUniqueEmail } from '../../api/authApi';

describe('API > Authentication API Tests', () => {
  let authService: AuthService;

  before(() => {
    authService = new AuthService();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user', () => {
      const newUser = {
        name: 'Register',
        surname: 'TestUser',
        email: generateUniqueEmail('register-test'),
        password: 'TestPassword123!',
      };

      // Send invitation first (required by backend)
      authService.sendInvitation(newUser.email).then(() => {
        authService.register(newUser).then((response) => {
          authService.verifyRegistrationSuccess(response);
          expect(response.body.data.user.email).to.equal(newUser.email);
          expect(response.body.data.user.name).to.equal(newUser.name);
        });
      });
    });

    it('should return error when email already exists', () => {
      const email = generateUniqueEmail('duplicate-test');
      const firstUser = {
        name: 'First',
        surname: 'User',
        email: email,
        password: 'TestPassword123!',
      };

      // Send invitation and register first user
      authService.sendInvitation(email).then(() => {
        authService.register(firstUser).then(() => {
          // Send another invitation for the same email
          authService.sendInvitation(email).then(() => {
            // Try to register with same email
            authService
              .register({
                name: 'Second',
                surname: 'User',
                email: email,
                password: 'DifferentPassword123!',
              })
              .then((response) => {
                authService.verifyConflict(response);
              });
          });
        });
      });
    });

    it('should return error when name is missing', () => {
      const email = generateUniqueEmail('no-name');

      authService.sendInvitation(email).then(() => {
        authService
          .register({
            name: '',
            surname: 'User',
            email: email,
            password: 'TestPassword123!',
          })
          .then((response) => {
            authService.verifyBadRequest(response);
          });
      });
    });

    it('should return error when email is missing', () => {
      authService
        .register({
          name: 'Test',
          surname: 'User',
          email: '',
          password: 'TestPassword123!',
        })
        .then((response) => {
          authService.verifyBadRequest(response);
        });
    });

    it('should return error when password is missing', () => {
      const email = generateUniqueEmail('no-password');

      authService.sendInvitation(email).then(() => {
        authService
          .register({
            name: 'Test',
            surname: 'User',
            email: email,
            password: '',
          })
          .then((response) => {
            authService.verifyBadRequest(response);
          });
      });
    });

    it('should return error for invalid email format', () => {
      authService
        .register({
          name: 'Test',
          surname: 'User',
          email: 'invalid-email-format',
          password: 'TestPassword123!',
        })
        .then((response) => {
          authService.verifyBadRequest(response);
        });
    });

    it('should return error when no invitation exists', () => {
      const email = generateUniqueEmail('no-invitation');

      authService
        .register({
          name: 'Test',
          surname: 'User',
          email: email,
          password: 'TestPassword123!',
        })
        .then((response) => {
          // Backend returns 404 for missing invitation (resource not found)
          authService.verifyStatus(response, 404);
          authService.verifyResponseProperty(response, 'success', false);
          expect(response.body.error).to.not.be.null;
          expect(response.body.error?.code).to.equal('USER_INVITATION_NOT_FOUND');
        });
    });

    it('should return token in registration response', () => {
      const newUser = {
        name: 'Token',
        surname: 'TestUser',
        email: generateUniqueEmail('token-test'),
        password: 'TestPassword123!',
      };

      authService.sendInvitation(newUser.email).then(() => {
        authService.register(newUser).then((response) => {
          authService.verifyRegistrationSuccess(response);
          expect(response.body.data.token).to.be.a('string');
          expect(response.body.data.token.length).to.be.greaterThan(0);
        });
      });
    });

    it('should return user ID in registration response', () => {
      const newUser = {
        name: 'ID',
        surname: 'TestUser',
        email: generateUniqueEmail('id-test'),
        password: 'TestPassword123!',
      };

      authService.sendInvitation(newUser.email).then(() => {
        authService.register(newUser).then((response) => {
          authService.verifyRegistrationSuccess(response);
          expect(response.body.data.user.id).to.be.a('string');
          expect(response.body.data.user.id.length).to.be.greaterThan(0);
        });
      });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const loginTestUser = {
      name: 'Login',
      surname: 'TestUser',
      email: generateUniqueEmail('login-api'),
      password: 'LoginPassword123!',
    };

    before(() => {
      // Create user for login tests - send invitation first
      authService.sendInvitation(loginTestUser.email).then(() => {
        authService.register(loginTestUser);
      });
    });

    it('should successfully login with valid credentials', () => {
      authService
        .login({
          email: loginTestUser.email,
          password: loginTestUser.password,
        })
        .then((response) => {
          authService.verifyLoginSuccess(response);
          expect(response.body.data.user.email).to.equal(loginTestUser.email);
        });
    });

    it('should return error with invalid password', () => {
      authService
        .login({
          email: loginTestUser.email,
          password: 'WrongPassword123!',
        })
        .then((response) => {
          authService.verifyInvalidCredentials(response);
        });
    });

    it('should return error with non-existent email', () => {
      authService
        .login({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        })
        .then((response) => {
          authService.verifyInvalidCredentials(response);
        });
    });

    it('should return error when email is missing', () => {
      authService
        .login({
          email: '',
          password: loginTestUser.password,
        })
        .then((response) => {
          authService.verifyBadRequest(response);
        });
    });

    it('should return error when password is missing', () => {
      authService
        .login({
          email: loginTestUser.email,
          password: '',
        })
        .then((response) => {
          authService.verifyBadRequest(response);
        });
    });

    it('should return token on successful login', () => {
      authService
        .login({
          email: loginTestUser.email,
          password: loginTestUser.password,
        })
        .then((response) => {
          authService.verifyLoginSuccess(response);
          expect(response.body.data.token).to.be.a('string');
          expect(response.body.data.token.length).to.be.greaterThan(0);
        });
    });

    it('should return user information on successful login', () => {
      authService
        .login({
          email: loginTestUser.email,
          password: loginTestUser.password,
        })
        .then((response) => {
          authService.verifyLoginSuccess(response);
          expect(response.body.data.user).to.have.property('id');
          expect(response.body.data.user).to.have.property('email', loginTestUser.email);
          expect(response.body.data.user).to.have.property('name');
        });
    });

    it('should respond within acceptable time', () => {
      authService
        .login({
          email: loginTestUser.email,
          password: loginTestUser.password,
        })
        .then((response) => {
          authService.verifyLoginSuccess(response);
          authService.verifyResponseTime(response, 2000); // Max 2 seconds
        });
    });
  });

  describe('GET /api/v1/users/:id', () => {
    const profileTestUser = {
      name: 'Profile',
      surname: 'TestUser',
      email: generateUniqueEmail('profile-api'),
      password: 'ProfilePassword123!',
    };
    let authToken: string;
    let userId: string;

    before(() => {
      // Create user and get token and ID - send invitation first
      authService.sendInvitation(profileTestUser.email).then(() => {
        authService.register(profileTestUser).then((response) => {
          authToken = response.body.data.token;
          userId = response.body.data.user.id;
          authService.setToken(authToken);
        });
      });
    });

    it('should return user by ID with valid token', () => {
      authService.getUser(userId).then((response) => {
        authService.verifyStatus(response, 200);
        expect(response.body.data).to.have.property('email', profileTestUser.email);
        expect(response.body.data).to.have.property('name', profileTestUser.name);
        expect(response.body.data).to.have.property('id', userId);
      });
    });

    it('should return 401 without authentication token', () => {
      authService.clearToken();
      authService.getUser(userId).then((response) => {
        authService.verifyUnauthorized(response);
      });
    });

    it('should return 401 with invalid token', () => {
      authService.setToken('invalid.jwt.token');
      authService.getUser(userId).then((response) => {
        authService.verifyUnauthorized(response);
      });
    });

    it('should return 404 for non-existent user', () => {
      authService.setToken(authToken); // Reset valid token
      authService.getUser('00000000-0000-0000-0000-000000000000').then((response) => {
        authService.verifyStatus(response, 404);
      });
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should complete full registration and get user flow', () => {
      const newUser = {
        name: 'Integration',
        surname: 'TestUser',
        email: generateUniqueEmail('integration'),
        password: 'IntegrationPassword123!',
      };

      // Send invitation and register
      authService.sendInvitation(newUser.email).then(() => {
        authService.register(newUser).then((registerResponse) => {
          authService.verifyRegistrationSuccess(registerResponse);
          const registeredToken = registerResponse.body.data.token;
          const registeredUserId = registerResponse.body.data.user.id;

          // Use token to get user
          authService.setToken(registeredToken);
          authService.getUser(registeredUserId).then((profileResponse) => {
            authService.verifyStatus(profileResponse, 200);
            expect(profileResponse.body.data.email).to.equal(newUser.email);
          });
        });
      });
    });

    it('should allow login with newly registered user', () => {
      const newUser = {
        name: 'NewLogin',
        surname: 'TestUser',
        email: generateUniqueEmail('new-login'),
        password: 'NewLoginPassword123!',
      };

      // Send invitation and register
      authService.sendInvitation(newUser.email).then(() => {
        authService.register(newUser).then(() => {
          // Login with same credentials
          authService
            .login({
              email: newUser.email,
              password: newUser.password,
            })
            .then((loginResponse) => {
              authService.verifyLoginSuccess(loginResponse);
            });
        });
      });
    });
  });
});
