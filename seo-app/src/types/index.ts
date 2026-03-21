export interface MonthlySearch {
  year: number;
  month: number;
  search_volume: number;
}

export interface KeywordData {
  keyword: string;
  search_volume: number;
  cpc: number | null;
  competition: string;
  competition_index: number;
  low_top_of_page_bid: number | null;
  high_top_of_page_bid: number | null;
  monthly_searches?: MonthlySearch[];
}

export interface SeoResult {
  keywordData: KeywordData;
  relatedKeywords?: KeywordData[];
}

export interface AiInsight {
  summary: string;
  strategy: string[];
  recommendation: string;
  keywordIdeas: string[];
}
