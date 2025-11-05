import { UserService } from '../../api/UserService';
import { generateRandomPerson, generateRandomEmail } from '../../utils/dataGenerator';

describe('User API Tests', () => {
  let userService: UserService;

  before(() => {
    userService = new UserService();
  });

  describe('GET /users', () => {
    it('should get all users', () => {
      userService.getAllUsers().then((response) => {
        userService.verifyUserListResponse(response);
        userService.verifyResponseTime(response, 2000);
      });
    });

    it('should get users with pagination', () => {
      userService.getAllUsers({ page: 1, limit: 10 }).then((response) => {
        userService.verifyStatus(response, 200);
        userService.verifyResponseIsArray(response);
        userService.verifyArrayLength(response, { max: 10 });
      });
    });

    it('should search users by username', () => {
      const searchTerm = 'test';
      userService.searchUsers(searchTerm).then((response) => {
        userService.verifyStatus(response, 200);
        userService.verifyResponseIsArray(response);
      });
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by ID', () => {
      const userId = 1;
      userService.getUserById(userId).then((response) => {
        userService.verifyUserDetailsResponse(response);
        userService.verifyResponseHasProperty(response, 'id');
        userService.verifyResponseProperty(response, 'id', userId);
      });
    });

    it('should return 404 for non-existent user', () => {
      const nonExistentId = 99999;
      userService.getUserById(nonExistentId).then((response) => {
        userService.verifyStatus(response, 404);
      });
    });
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      const person = generateRandomPerson();
      const userData = {
        username: person.username,
        email: person.email,
        password: person.password,
        firstName: person.firstName,
        lastName: person.lastName,
      };

      userService.createUser(userData).then((response) => {
        userService.verifyUserCreationResponse(response);
        userService.verifyResponseProperty(response, 'username', userData.username);
        userService.verifyResponseProperty(response, 'email', userData.email);
      });
    });

    it('should not create user with duplicate username', () => {
      const userData = {
        username: 'existinguser',
        email: generateRandomEmail(),
        password: 'password123',
      };

      userService.createUser(userData).then((response) => {
        userService.verifyStatus(response, 409); // Conflict
        userService.verifyResponseHasProperty(response, 'message');
      });
    });

    it('should not create user without required fields', () => {
      const incompleteData = {
        username: 'testuser',
      } as any;

      userService.createUser(incompleteData).then((response) => {
        userService.verifyStatus(response, 400); // Bad Request
      });
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user', () => {
      const userId = 1;
      const person = generateRandomPerson();
      const updateData = {
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.email,
      };

      userService.updateUser(userId, updateData).then((response) => {
        userService.verifyStatus(response, 200);
        userService.verifyResponseProperty(response, 'firstName', updateData.firstName);
      });
    });

    it('should not update non-existent user', () => {
      const nonExistentId = 99999;
      const updateData = { firstName: 'John' };

      userService.updateUser(nonExistentId, updateData).then((response) => {
        userService.verifyStatus(response, 404);
      });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', () => {
      // First create a user to delete
      const person = generateRandomPerson();
      const userData = {
        username: person.username,
        email: person.email,
        password: person.password,
      };

      userService.createUser(userData).then((createResponse) => {
        const userId = createResponse.body.id;

        // Now delete the user
        userService.deleteUser(userId).then((deleteResponse) => {
          userService.verifyUserDeletionResponse(deleteResponse);

          // Verify user is deleted
          userService.getUserById(userId).then((getResponse) => {
            userService.verifyStatus(getResponse, 404);
          });
        });
      });
    });

    it('should not delete non-existent user', () => {
      const nonExistentId = 99999;

      userService.deleteUser(nonExistentId).then((response) => {
        userService.verifyStatus(response, 404);
      });
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', () => {
      const credentials = {
        username: 'testuser',
        password: 'testpass123',
      };

      userService.loginUser(credentials).then((response) => {
        userService.verifyLoginResponse(response);
      });
    });

    it('should not login with invalid credentials', () => {
      const invalidCredentials = {
        username: 'invaliduser',
        password: 'wrongpassword',
      };

      userService.loginUser(invalidCredentials).then((response) => {
        userService.verifyUnauthorizedResponse(response);
      });
    });

    it('should not login without password', () => {
      const incompleteCredentials = {
        username: 'testuser',
        password: '',
      };

      userService.loginUser(incompleteCredentials).then((response) => {
        userService.verifyStatus(response, 400);
      });
    });
  });

  describe('GET /users/profile', () => {
    it('should get user profile with valid token', () => {
      // Login first to get token
      const credentials = {
        username: 'testuser',
        password: 'testpass123',
      };

      userService.loginUser(credentials).then((_loginResponse) => {
        userService.getUserProfile().then((profileResponse) => {
          userService.verifyUserDetailsResponse(profileResponse, credentials.username);
        });
      });
    });

    it('should not get profile without authentication', () => {
      // Remove auth token
      userService['removeAuthToken']();

      userService.getUserProfile().then((response) => {
        userService.verifyUnauthorizedResponse(response);
      });
    });
  });

  describe('PUT /users/profile', () => {
    it('should update user profile', () => {
      // Login first
      const credentials = {
        username: 'testuser',
        password: 'testpass123',
      };

      userService.loginUser(credentials).then(() => {
        const person = generateRandomPerson();
        const updateData = {
          firstName: person.firstName,
          lastName: person.lastName,
          bio: 'Updated bio',
        };

        userService.updateUserProfile(updateData).then((response) => {
          userService.verifyStatus(response, 200);
          userService.verifyResponseProperty(response, 'firstName', updateData.firstName);
        });
      });
    });
  });
});
