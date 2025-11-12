/**
 * Repository Module
 * Central exports for all repository interfaces and implementations
 */

// Factory Functions (Production Implementations)
import { createUserRepository } from "#infrastructure/repositories/drizzle/UserRepository";
import { createSessionRepository } from "#infrastructure/repositories/drizzle/SessionRepository";
import { createCompanyRepository } from "#infrastructure/repositories/drizzle/CompanyRepository";
import { createProjectRepository } from "#infrastructure/repositories/drizzle/ProjectRepository";

export {
  createUserRepository,
  type UserRepository,
} from "#infrastructure/repositories/drizzle/UserRepository";

export {
  createSessionRepository,
  type SessionRepository,
} from "#infrastructure/repositories/drizzle/SessionRepository";

export {
  createCompanyRepository,
  type CompanyRepository,
} from "#infrastructure/repositories/drizzle/CompanyRepository";

export {
  createProjectRepository,
  type ProjectRepository,
} from "#infrastructure/repositories/drizzle/ProjectRepository";

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

/**
 * Singleton company repository instance
 */
export const companyRepository = createCompanyRepository(db);

/**
 * Singleton project repository instance
 */
export const projectRepository = createProjectRepository(db);
