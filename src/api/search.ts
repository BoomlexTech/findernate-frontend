import axios from './base';

export interface SearchResponse {
  statusCode: number;
  data: {
    results: any[];
    users: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
  success: boolean;
}

export const searchAllContent = async (
  q: string,
  near?: string,
  distance?: number
): Promise<SearchResponse> => {
  const params: Record<string, string | number> = { q };
  if (near) params.near = near;
  if (distance) params.distance = distance;

  const response = await axios.get('/users/searchAllContent', { params });
  return response.data;
};

export const searchUsers = async (query: string): Promise<SearchResponse> => {
  const response = await axios.get('/users/profile/search', { params: { query } });
  return response.data;
};


