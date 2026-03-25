import type { SeoResult } from '../types';
import { estimateSeoMetrics } from './gemini';

// Replace these with actual DataForSEO endpoints and credentials
const DATAFORSEO_API_URL = 'https://api.dataforseo.com/v3';

export async function fetchSeoData(keyword: string, country: string = 'BR', engine: string = 'google'): Promise<SeoResult> {
  const login = import.meta.env.VITE_DATAFORSEO_LOGIN;
  const password = import.meta.env.VITE_DATAFORSEO_PASSWORD;

  if (!login || !password) {
    console.warn("DataForSEO credentials not found in .env. Returning AI Estimated data.");
    return estimateSeoMetrics(keyword, country, engine);
  }

  try {
    const post_array = [{
      keywords: [keyword],
      location_name: "Brazil",
      language_name: "Portuguese",
      sort_by: "relevance"
    }];

    const response = await fetch(`${DATAFORSEO_API_URL}/keywords_data/google_ads/search_volume/live`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${login}:${password}`),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post_array)
    });

    if (!response.ok) {
      if (response.status === 402) {
        console.warn("DataForSEO balance exhausted. Falling back to AI estimation.");
        return estimateSeoMetrics(keyword, country, engine);
      }
      throw new Error(`DataForSEO API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response based on DataForSEO v3 structure (handling both full API array and single task object)
    const taskResult = data.tasks ? data.tasks[0]?.result : data.result;
    const resultItem = taskResult?.[0]?.items ? taskResult[0]?.items?.[0] : taskResult?.[0];
    
    if (!resultItem) {
      return estimateSeoMetrics(keyword, country, engine);
    }

    return {
      keywordData: {
        keyword: resultItem.keyword,
        search_volume: resultItem.search_volume || 0,
        cpc: resultItem.cpc || 0,
        competition: resultItem.competition || "N/A",
        competition_index: resultItem.competition_index || 0,
        low_top_of_page_bid: resultItem.low_top_of_page_bid || 0,
        high_top_of_page_bid: resultItem.high_top_of_page_bid || 0,
        monthly_searches: resultItem.monthly_searches || []
      }
    };

  } catch (error) {
    console.error("Error fetching SEO data, using AI estimation:", error);
    return estimateSeoMetrics(keyword, country, engine);
  }
}
