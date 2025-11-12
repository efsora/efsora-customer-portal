/**
 * Company Output Types
 */

export type CompanyData = {
  id: number;
  name: string;
  logoUrl: string | null;
  adminUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCompanyResult = CompanyData;
export type UpdateCompanyResult = CompanyData;
export type GetCompanyResult = CompanyData;
export type GetAllCompaniesResult = CompanyData[];
export type DeleteCompanyResult = {
  id: number;
  message: string;
};
