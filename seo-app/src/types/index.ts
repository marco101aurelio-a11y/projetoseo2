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
  currency?: string;
  engine?: string;
  country?: string;
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

export interface DreData {
  receita_bruta: number;
  investimento_ads: number;
  custos_variaveis: {
    total: number;
    impostos: number;
    frete: number;
    comissao_mktp: number;
    cogs_produto: number;
  };
  margem_contribuicao: number;
  custos_fixos: number;
  ebitda_final: number;
}

export interface FinanceResult {
  summary: {
    revenue: number;
    ebitda: number;
    ebitda_pct: number;
    status: string;
    real_ticket_medio?: number;
  };
  detailed_dre: DreData;
  benchmarks_applied?: any;
}

export interface Label {
  id: string;
  title: string;
  color: string;
}

export type Project = {
  id: string;
  title?: string;
  name?: string;
  url?: string;
  description?: string;
  createdAt?: string;
  date?: string;
  sources?: number;
  keywords?: string[];
  labelIds?: string[];
  cover?: {
    type: 'color' | 'image';
    value: string;
    size: 'half' | 'full';
  };
  archived?: boolean;
  startDate?: string;
  endDate?: string;
}
