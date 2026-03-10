export type RemoteCategory = "full" | "partial" | "none" | "unknown";
export type FilterType = "all" | "full" | "partial";

export type CompanyLink = {
  label: string;
  url: string;
};

export type RemoteCompany = {
  id: string;
  companyName: string;
  flexibleWork: string;
  remoteWork: string;
  remoteCategory: RemoteCategory;
  isRemotePossible: boolean;
  links: CompanyLink[];
};

export type RemoteCompanySummary = {
  total: number;
  fullRemoteCount: number;
  partialRemoteCount: number;
};
