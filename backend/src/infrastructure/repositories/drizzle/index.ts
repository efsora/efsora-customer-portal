/**
 * Repository Module
 * Central exports for all repository interfaces and implementations
 */

// Factory Functions (Production Implementations)
import { createUserRepository } from "#infrastructure/repositories/drizzle/UserRepository";
import { createSessionRepository } from "#infrastructure/repositories/drizzle/SessionRepository";

export {
  createUserRepository,
  type UserRepository,
} from "#infrastructure/repositories/drizzle/UserRepository";

export {
  createSessionRepository,
  type SessionRepository,
} from "#infrastructure/repositories/drizzle/SessionRepository";

// Singleton Instances
import { db } from "#db/client";

/**
 * Singleton user repository instance
 */
export const userRepository = createUserRepository(db);

/**
 * Singleton session repository instance
 */
export const sessionRepository = createSessionRepository(db);
