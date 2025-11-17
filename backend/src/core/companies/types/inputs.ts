/**
 * Company Input Types
 */

export type CreateCompanyInput = {
  name: string;
  logoUrl?: string | null;
  adminUserId?: string | null;
};

export type UpdateCompanyInput = {
  name?: string;
  logoUrl?: string | null;
  adminUserId?: string | null;
};

export type CompanyIdInput = {
  id: number;
};
