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

export const savePost = async (postId: string) => {
  const response = await axios.post('/posts/save', { postId })
  return response.data
}

export const getSavedPost = async () => {
  const response = await axios.get('posts/saved')
  return response.data
}

export const unsavePost = async (postId: string) => {
  const response = await axios.delete(`/posts/save/${postId}`)
  return response.data
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