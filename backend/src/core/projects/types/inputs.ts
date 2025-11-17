/**
 * Project Input Types
 * Define input structures for project operations
 */

/**
 * Input for creating a new project
 */
export type CreateProjectInput = {
  name: string;
  companyId: number;
  status?: number | null;
};

/**
 * Input for updating a project
 */
export type UpdateProjectInput = {
  name?: string;
  status?: number | null;
};

/**
 * Input containing project ID
 */
export type ProjectIdInput = {
  id: number;
};

/**
 * Input for finding projects by company
 */
export type FindProjectsByCompanyInput = {
  companyId: number;
};

/**
 * Input for getting team members by project
 */
export type GetYourTeamInput = {
  projectId: number;
  userId: string;
};
