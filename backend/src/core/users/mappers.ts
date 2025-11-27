import type { User } from "#db/schema";
import type { UserData, ExtendedUserData } from "#core/users/types/outputs";

/**
 * Maps User entity to UserData DTO (excludes password)
 *
 * @param user - User entity from database
 * @returns UserData DTO without sensitive fields
 */
export function mapUserToUserData(user: User): UserData {
  return {
    createdAt: user.createdAt,
    email: user.email,
    id: user.id,
    name: user.name,
    surname: user.surname,
    updatedAt: user.updatedAt,
    projectId: user.projectId,
    companyId: user.companyId,
  };
}

/**
 * Maps User entity to ExtendedUserData DTO (includes company, role, project references)
 *
 * @param user - User entity from database
 * @returns ExtendedUserData DTO without sensitive fields
 */
export function mapUserToExtendedUserData(user: User): ExtendedUserData {
  return {
    bio: user.bio,
    companyId: user.companyId,
    createdAt: user.createdAt,
    email: user.email,
    id: user.id,
    name: user.name,
    projectId: user.projectId,
    roleId: user.roleId,
    surname: user.surname,
    updatedAt: user.updatedAt,
  };
}
