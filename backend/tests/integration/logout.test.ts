import { createUser } from "#core/users/index";
import { run } from "#lib/result/index";
import type { AppResponse } from "#lib/types/response";
import type { AuthenticatedRequest } from "#middlewares/auth";
import { handleLogout } from "#routes/auth/handlers";
import type { LogoutResponse } from "#routes/auth/schemas";
import { describe, expect, it, beforeEach } from "vitest";
import { cleanupDatabase } from "../helpers/database";
import { createTestInvitation } from "../helpers/invitation";

describe("Logout Endpoint Integration Tests", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe("POST /auth/logout", () => {
    it("should logout successfully with valid authentication", async () => {
      // First, create invitation and user to get a userId and token
      await createTestInvitation("logout-test@example.com");

      const registerInput = {
        email: "logout-test@example.com",
        password: "SecurePass123",
        name: "Logout Test User",
      };

      const registerResult = await run(createUser(registerInput));
      expect(registerResult.status).toBe("Success");

      let userId = "";
      let token = "";
      if (registerResult.status === "Success") {
        userId = registerResult.value.user.id;
        token = registerResult.value.token;
      }

      // Create a mock authenticated request with headers
      const mockRequest = {
        userId,
        user: {
          userId,
          email: "logout-test@example.com",
        },
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as AuthenticatedRequest;

      // Call logout handler
      const response: AppResponse<LogoutResponse> =
        await handleLogout(mockRequest);

      // Verify response
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.message).toBe("Logged out successfully");
        expect(response.traceId).toBeDefined();
      }
    });

    it("should return success response with proper structure", async () => {
      // Create invitation and user
      await createTestInvitation("structure-test@example.com");

      const registerInput = {
        email: "structure-test@example.com",
        password: "SecurePass123",
        name: "Structure Test",
      };

      const registerResult = await run(createUser(registerInput));
      expect(registerResult.status).toBe("Success");

      let userId = "";
      let token = "";
      if (registerResult.status === "Success") {
        userId = registerResult.value.user.id;
        token = registerResult.value.token;
      }

      // Create authenticated request with headers
      const mockRequest = {
        userId,
        user: {
          userId,
          email: "structure-test@example.com",
        },
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as AuthenticatedRequest;

      // Call logout
      const response = await handleLogout(mockRequest);

      // Verify AppResponse structure
      expect(response).toHaveProperty("success");
      expect(response).toHaveProperty("traceId");

      if (response.success) {
        expect(response).toHaveProperty("data");
        expect(response.data).toHaveProperty("message");
        expect(response.error).toBeNull();
        expect(typeof response.data.message).toBe("string");
      }
    });

    it("should handle logout for different users independently", async () => {
      // Create invitations for two users
      await createTestInvitation("logout-user1@example.com");
      await createTestInvitation("logout-user2@example.com");

      // Create two users with unique emails to avoid conflicts
      const user1Result = await run(
        createUser({
          email: "logout-user1@example.com",
          password: "SecurePass123",
          name: "Logout User 1",
        }),
      );
      expect(user1Result.status).toBe("Success");

      const user2Result = await run(
        createUser({
          email: "logout-user2@example.com",
          password: "SecurePass123",
          name: "Logout User 2",
        }),
      );
      expect(user2Result.status).toBe("Success");

      // Get userIds and tokens
      let userId1 = "";
      let token1 = "";
      let userId2 = "";
      let token2 = "";

      if (user1Result.status === "Success") {
        userId1 = user1Result.value.user.id;
        token1 = user1Result.value.token;
      }
      if (user2Result.status === "Success") {
        userId2 = user2Result.value.user.id;
        token2 = user2Result.value.token;
      }

      // Logout user 1
      const req1 = {
        userId: userId1,
        user: { userId: userId1, email: "logout-user1@example.com" },
        headers: {
          authorization: `Bearer ${token1}`,
        },
      } as AuthenticatedRequest;

      const response1 = await handleLogout(req1);
      expect(response1.success).toBe(true);

      // Logout user 2
      const req2 = {
        userId: userId2,
        user: { userId: userId2, email: "logout-user2@example.com" },
        headers: {
          authorization: `Bearer ${token2}`,
        },
      } as AuthenticatedRequest;

      const response2 = await handleLogout(req2);
      expect(response2.success).toBe(true);

      // Both should succeed independently
      if (response1.success && response2.success) {
        expect(response1.data.message).toBe("Logged out successfully");
        expect(response2.data.message).toBe("Logged out successfully");
        // Note: traceIds may be 'unknown' in test environment, so we don't assert on them
      }
    });
  });
});
