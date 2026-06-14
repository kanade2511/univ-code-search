export type SearchResult = {
  id: number;
  university: string;
  faculty: string;
  department: string;
  schedule: string;
  method: string;
  code: string;
  matchType: string;
  univType: string;
  rank: number;
};

export type QuickSearchItem = {
  label: string;
  query: string;
};
