import axios from './base';
import { BusinessPostFormProps, ProductDetailsFormProps, ServiceDetailsFormProps } from '@/types';
import buildFormData from '@/utils/formDataBuilder';

export type EditPostPayload = {
  caption?: string;
  description?: string;
  mood?: string;
  activity?: string;
  tags?: string[];
};

export const createRegularPost = async (data: {
  description: string;
  location: { name: string };
  tags: string[];
  image: File[];
  postType: string;
  caption: string;
  mood: string;
  activity: string;
  mentions: string[];
  settings: {
    visibility: string;
    allowComments: boolean;
    allowLikes: boolean;
  };
  status: string;
}) => {
  const formData = new FormData();

  formData.append('description', data.description);
  formData.append('postType', data.postType);
  formData.append('caption', data.caption);
  formData.append('mood', data.mood);
  formData.append('activity', data.activity);
  formData.append('status', data.status);

  formData.append('location', JSON.stringify(data.location));
  formData.append('settings', JSON.stringify(data.settings));
  formData.append('tags', JSON.stringify(data.tags));
  formData.append('mentions', JSON.stringify(data.mentions));

  data.image.forEach((file) => {
    formData.append('image', file);
  });
  for (const pair of formData.entries()) {
    console.log(pair[0] + ':', pair[1]);
  }
  const response = await axios.post('/posts/create/normal', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const createProductPost = async  ({ formData }: { formData: ProductDetailsFormProps['formData'] }) => {
  const fd = new FormData();
  buildFormData(fd, formData);
  for (const pair of fd.entries()) {
    console.log(pair[0] + ':', pair[1]);
  }
  const response = await axios.post('/posts/create/product', fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createServicePost = async ({formData}: {formData: ServiceDetailsFormProps['formData'] }) => {
  const fd = new FormData();
  buildFormData(fd, formData);
  const response = await axios.post('/posts/create/service', fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createBusinessPost = async ({formData}: {formData: BusinessPostFormProps['formData'] }) => {
  const fd = new FormData();
  buildFormData(fd, formData);
  for (const pair of fd.entries()) {
    console.log(pair[0]+ ', ' + pair[1]);
  }
  const response = await axios.post('/posts/create/business', fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get single post
export const getPostById = async (postId: string) => {
  const response = await axios.get(`/posts/${postId}`);
  return response.data.data;
};


// Like/Unlike functions
export const likePost = async (postId: string) => {
  try {
    console.log('API: Calling likePost with postId:', postId);
    console.log('API: Base URL:', axios.defaults.baseURL);
    console.log('API: Full URL will be:', `${axios.defaults.baseURL}/posts/like`);
    
    const response = await axios.post('/posts/like', { postId }, { timeout: 10000 });
    console.log('API: likePost response:', response.data);
    return response.data;
  } catch (error: unknown) {
    const err = error as Error;
    const axiosError = error as { 
      response?: { 
        data?: unknown; 
        status?: number; 
        statusText?: string;
      }; 
      message?: string;
      code?: string;
      config?: { url?: string; method?: string };
    };
    
    console.error('Error in likePost:', {
      message: err.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      code: axiosError.code,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      postId,
      fullError: error
    });
    throw error;
  }
};

export const unlikePost = async (postId: string) => {
  try {
    console.log('API: Calling unlikePost with postId:', postId);
    console.log('API: Base URL:', axios.defaults.baseURL);
    console.log('API: Full URL will be:', `${axios.defaults.baseURL}/posts/unlike`);
    
    // Try the request with explicit JSON data
    const requestData = { postId };
    console.log('API: Request data:', requestData);
    
    const response = await axios.post('/posts/unlike', requestData, { 
      timeout: 15000,  // Reduced timeout to fail faster
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('API: unlikePost response:', response.data);
    return response.data;
  } catch (error: unknown) {
    const err = error as Error;
    const axiosError = error as { 
      response?: { 
        data?: unknown; 
        status?: number; 
        statusText?: string;
      }; 
      message?: string;
      code?: string;
      config?: { url?: string; method?: string };
    };
    
    console.error('Error in unlikePost:', {
      message: err.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      code: axiosError.code,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      postId,
      fullError: error
    });
    throw error;
  }
};

export const savePost = async (postId: string, privacy: 'private' | 'public' = 'private') => {
  try {
    console.log('=== SAVE POST DEBUG START ===');
    console.log('🔸 Function called with parameters:');
    console.log('  - postId:', postId);
    console.log('  - postId type:', typeof postId);
    console.log('  - privacy:', privacy);
    console.log('  - privacy type:', typeof privacy);
    
    console.log('🔸 Base URL configuration:');
    console.log('  - axios.defaults.baseURL:', axios.defaults.baseURL);
    console.log('  - Full URL will be:', `${axios.defaults.baseURL}/posts/save`);
    
    // Ensure we're sending exactly the format specified by the backend
    const requestData = { 
      postId: postId,
      privacy: privacy 
    };
    
    console.log('🔸 Request payload being sent:');
    console.log('  - Raw object:', requestData);
    console.log('  - JSON stringified:', JSON.stringify(requestData));
    console.log('  - Object keys:', Object.keys(requestData));
    console.log('  - Object values:', Object.values(requestData));
    
    console.log('🔸 Request headers:');
    const headers = {
      'Content-Type': 'application/json'
    };
    console.log('  - Headers object:', headers);
    
    console.log('🔸 Making POST request to /posts/save...');
    const response = await axios.post('/posts/save', requestData, { headers });
    
    console.log('🔸 Response received:');
    console.log('  - Status:', response.status);
    console.log('  - Status text:', response.statusText);
    console.log('  - Response data:', response.data);
    console.log('=== SAVE POST DEBUG END ===');
    
    return response.data;
  } catch (error) {
    console.error('=== SAVE POST ERROR DEBUG START ===');
    console.error('❌ Error saving post:', error);
    const axiosError = error as any;
    
    console.error('🔸 Error details:');
    console.error('  - Error message:', axiosError?.message);
    console.error('  - Error name:', axiosError?.name);
    console.error('  - Error code:', axiosError?.code);
    
    if (axiosError?.response) {
      console.error('🔸 Response error details:');
      console.error('  - Status:', axiosError.response.status);
      console.error('  - Status text:', axiosError.response.statusText);
      console.error('  - Response data:', axiosError.response.data);
      console.error('  - Response headers:', axiosError.response.headers);
    }
    
    if (axiosError?.request) {
      console.error('🔸 Request details:');
      console.error('  - Request URL:', axiosError.request.responseURL);
      console.error('  - Request method:', axiosError.config?.method);
      console.error('  - Request data:', axiosError.config?.data);
      console.error('  - Request headers:', axiosError.config?.headers);
    }
    
    console.error('=== SAVE POST ERROR DEBUG END ===');
    throw error;
  }
}

export const getPrivateSavedPosts = async (page: number = 1, limit: number = 10) => {
  try {
    console.log('=== DEBUG: Fetching private saved posts, page:', page, 'limit:', limit);
    const response = await axios.get(`/posts/saved/private?page=${page}&limit=${limit}`)
    console.log('=== DEBUG: Private saved posts response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== DEBUG: Error fetching private saved posts:', error);
    throw error;
  }
}

export const getPublicSavedPosts = async (page: number = 1, limit: number = 10) => {
  try {
    console.log('=== DEBUG: Fetching public saved posts, page:', page, 'limit:', limit);
    const response = await axios.get(`/posts/saved/public?page=${page}&limit=${limit}`)
    console.log('=== DEBUG: Public saved posts response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== DEBUG: Error fetching public saved posts:', error);
    throw error;
  }
}

// Legacy function - keeping for backward compatibility, fetches private posts by default
export const getSavedPost = async () => {
  const response = await axios.get('/posts/saved/private?page=1&limit=100')
  return response.data
}

export const unsavePost = async (postId: string) => {
  const response = await axios.delete(`/posts/save/${postId}`)
  return response.data
}

// Get another user's public saved posts
export const getUserPublicSavedPosts = async (userId: string, page: number = 1, limit: number = 10) => {
  try {
    console.log('=== DEBUG: Fetching user public saved posts, userId:', userId, 'page:', page, 'limit:', limit);
    const response = await axios.get(`/posts/saved/user/${userId}?page=${page}&limit=${limit}`)
    console.log('=== DEBUG: User public saved posts response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== DEBUG: Error fetching user public saved posts:', error);
    throw error;
  }
}

// Toggle saved post privacy between private and public
// Note: Backend doesn't have a direct toggle endpoint, so we unsave and re-save with new privacy
export const toggleSavedPostPrivacy = async (postId: string, privacy: 'private' | 'public') => {
  try {
    console.log('=== DEBUG: Toggling saved post privacy:', { postId, privacy });
    
    // First unsave the post
    await unsavePost(postId);
    
    // Then re-save with new privacy
    const response = await savePost(postId, privacy);
    
    console.log('=== DEBUG: Toggle privacy response:', response);
    return response;
  } catch (error) {
    console.error('=== DEBUG: Error toggling saved post privacy:', error);
    throw error;
  }
}

// Note: Use getSavedPost() to get all saved posts and check if postId exists in the list
export const deletePost = async (postId: string) => {
  const response = await axios.delete(`/posts/${postId}`)
  return response.data
}

// Edit/Update post (user can only edit their own posts)
export const editPost = async (postId: string, payload: EditPostPayload) => {
  // Example endpoint provided by user shows /posts/edit/:postId
  const response = await axios.put(`/posts/edit/${postId}`, payload);
  return response.data;
}