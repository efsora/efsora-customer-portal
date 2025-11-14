/**
 * Project Output Types
 * Define output structures for project operations
 */

import type { ExtendedUserData } from "#core/users";

/**
 * Project data returned from operations
 */
export type ProjectData = {
  id: number;
  name: string;
  companyId: number | null;
  status: number | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Result for create project operation
 */
export type CreateProjectResult = ProjectData;

/**
 * Result for delete project operation
 */
export type DeleteProjectResult = {
  id: number;
  message: string;
};

/**
 * Result for get your team operation
 * Uses ExtendedUserData from users module
 */
export type GetYourTeamResult = {
  customerTeam: ExtendedUserData[];
  efsoraTeam: ExtendedUserData[];
};
