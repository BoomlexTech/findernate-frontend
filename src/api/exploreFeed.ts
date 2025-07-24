import axiosInstance from './base';

export interface ExploreFeedParams {
  page?: number;
  limit?: number;
  types?: 'product' | 'business' | 'service' | 'normal' | 'all';
  sortBy?: 'time' | 'likes' | 'comments' | 'shares' | 'views' | 'engagement';
}

export interface ExploreFeedResponse {
  statusCode: number;
  data: {
    feed: Array<any>;
    pagination: {
      page: number;
      limit: number;
      reelsCount: number;
      postsCount: number;
      total: number;
      hasNextPage: boolean;
    };
  };
  message: string;
}

export const getExploreFeed = async (params: ExploreFeedParams = {}): Promise<ExploreFeedResponse> => {
  
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.types) queryParams.append('types', params.types);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);

  const url = `/explore?${queryParams.toString()}`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};