/**
 * Repository Module
 * Central exports for all repository interfaces and implementations
 */

// Factory Functions (Production Implementations)
import { createUserRepository } from "#infrastructure/repositories/drizzle/UserRepository";
import { createSessionRepository } from "#infrastructure/repositories/drizzle/SessionRepository";
import { createCompanyRepository } from "#infrastructure/repositories/drizzle/CompanyRepository";
import { createProjectRepository } from "#infrastructure/repositories/drizzle/ProjectRepository";
import { createRoleRepository } from "#infrastructure/repositories/drizzle/RoleRepository";
import { createMilestoneRepository } from "#infrastructure/repositories/drizzle/MilestoneRepository";

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

export {
  createRoleRepository,
  type RoleRepository,
} from "#infrastructure/repositories/drizzle/RoleRepository";

export {
  createMilestoneRepository,
  type MilestoneRepository,
} from "#infrastructure/repositories/drizzle/MilestoneRepository";

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

/**
 * Singleton role repository instance
 */
export const roleRepository = createRoleRepository(db);

/**
 * Singleton milestone repository instance
 */
export const milestoneRepository = createMilestoneRepository(db);
