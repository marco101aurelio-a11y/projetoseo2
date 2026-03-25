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
  isResilient?: boolean;
  errorDetail?: string;
}

export interface AdStats {
  adName: string;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface CampaignData {
  dailySpend: number;
  roas: number;
  targetRoas: number;
  frequency: number;
}

export interface AudienceBehavior {
  daysSinceLastVisit: number;
  purchasesInLastSemester: number;
  averageTicket: number;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  description: string;
  createdAt: string;
  keywords: string[];
}
