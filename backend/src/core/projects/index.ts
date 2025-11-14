/**
 * Projects Module
 * Public API for project operations
 */

// Workflows
export { createProject } from "./workflows/create-project";
export { getProjectById, getAllProjects } from "./workflows/get-project";
export { updateProject } from "./workflows/update-project";
export { deleteProject } from "./workflows/delete-project";
export { getYourTeam } from "./workflows/get-your-team";

// Public types - Inputs
export type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectIdInput,
  FindProjectsByCompanyInput,
  GetYourTeamInput,
} from "./types/inputs";

// Public types - Outputs
export type {
  ProjectData,
  CreateProjectResult,
  DeleteProjectResult,
  GetYourTeamResult,
} from "./types/outputs";

// Public types - Errors
export type {
  ProjectNotFoundError,
  ProjectNameConflictError,
  CompanyNotFoundForProjectError,
  ProjectError,
} from "./types/errors";
