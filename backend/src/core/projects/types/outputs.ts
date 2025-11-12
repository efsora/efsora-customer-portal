/**
 * Project Output Types
 * Define output structures for project operations
 */

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
