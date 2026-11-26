// The shape of one threat sent back by the backend
export type Threat = {
  threatType: string;
  platformType?: string;
  threatEntryType?: string;
  threatUrl?: string;
};

// The shape of the "data" part of the check response
export type CheckResult = {
  url: string;
  isSafe: boolean;
  status: string;
  threats: Threat[];
};

// The shape of one entry in the history
export type HistoryEntry = {
  id: number;
  url: string;
  isSafe: boolean;
  status: string;
  threats: Threat[];
  checkedAt: string;
};