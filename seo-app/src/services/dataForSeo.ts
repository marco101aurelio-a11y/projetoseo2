import type { SeoResult } from '../types';

// Replace these with actual DataForSEO endpoints and credentials
const DATAFORSEO_API_URL = 'https://api.dataforseo.com/v3';

export async function fetchSeoData(keyword: string): Promise<SeoResult> {
  const login = import.meta.env.VITE_DATAFORSEO_LOGIN;
  const password = import.meta.env.VITE_DATAFORSEO_PASSWORD;

  if (!login || !password) {
    console.warn("DataForSEO credentials not found in .env. Returning mock data.");
    return getMockData(keyword);
  }

  try {
    const post_array = [{
      keywords: [keyword],
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
      throw new Error(`DataForSEO API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response based on DataForSEO v3 structure (handling both full API array and single task object)
    const taskResult = data.tasks ? data.tasks[0]?.result : data.result;
    const resultItem = taskResult?.[0]?.items ? taskResult[0]?.items?.[0] : taskResult?.[0];
    
    if (!resultItem) {
      throw new Error("No data found for this keyword.");
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
    console.error("Error fetching SEO data:", error);
    return getMockData(keyword); // Fallback to mock on error for MVP
  }
}

function getMockData(keyword: string): SeoResult {
  return {
    keywordData: {
      keyword,
      search_volume: Math.floor(Math.random() * 50000) + 1000,
      cpc: Number((Math.random() * 5).toFixed(2)),
      competition: "LOW",
      competition_index: Math.floor(Math.random() * 100),
      low_top_of_page_bid: Number((Math.random() * 2).toFixed(2)),
      high_top_of_page_bid: Number((Math.random() * 8 + 2).toFixed(2)),
      monthly_searches: []
    },
    relatedKeywords: [
      {
        keyword: `${keyword} comprar`,
        search_volume: 12000,
        cpc: 1.5,
        competition: "HIGH",
        competition_index: 85,
        low_top_of_page_bid: 0.5,
        high_top_of_page_bid: 4.5,
        monthly_searches: []
      },
      {
        keyword: `o que é ${keyword}`,
        search_volume: 8500,
        cpc: 0.5,
        competition: "LOW",
        competition_index: 12,
        low_top_of_page_bid: 0.1,
        high_top_of_page_bid: 1.2,
        monthly_searches: []
      }
    ]
  };
}
