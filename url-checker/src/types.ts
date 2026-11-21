// The shape of one threat sent back by the backend
export type Threat = {
  threatType: string;
  platformType: string;
  threatEntryType: string;
  threatUrl: string;
};

// The shape of the "data" part of the backend response
export type CheckResult = {
  url: string;
  isSafe: boolean;
  status: string;
  threats: Threat[];
};
