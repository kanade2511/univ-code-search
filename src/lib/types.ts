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

export type SearchResponse = {
  results: SearchResult[];
  total: number;
  exactCount: number;
  codeCount: number;
  page: number;
  limit: number;
};

export type DbRow = {
  id: number;
  university: string;
  faculty: string;
  department: string;
  schedule: string;
  method: string;
  code: string;
  rank: number;
  match_rank: number;
  match_type: string;
  univ_type: string;
};

export type QuickSearchItem = {
  label: string;
  query: string;
};
