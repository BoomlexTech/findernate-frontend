
// import { buildFormData } from '@/utils/formDataBuilder';
import axios from './base';
import { ProductDetailsFormProps } from '@/types';

export const createRegularPost = async (data: {
  description: string;
  location: { name: string };
  tags: string[],
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

    // Append simple fields
    formData.append('description', data.description);
    formData.append('postType', data.postType);
    formData.append('caption', data.caption);
    formData.append('mood', data.mood);
    formData.append('activity', data.activity);
    formData.append('status', data.status);
  
    // Append nested fields after stringifying
    formData.append('location', JSON.stringify(data.location));
    formData.append('settings', JSON.stringify(data.settings));
    formData.append('tags', JSON.stringify(data.tags));
    formData.append('mentions', JSON.stringify(data.mentions));
  
    // Append media files
    data.image.forEach((file) => {
      formData.append('image', file); // backend should accept this as an array
    });

  const response = await axios.post('/posts/create/normal', formData,{
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};


export const createProductPost = async  ({ formData }: { formData: ProductDetailsFormProps['formData'] }) => {
   
     const fd = new FormData();

      fd.append('postType', formData.postType);
      fd.append('mood', formData.mood);
      fd.append('activity', formData.activity);
      fd.append('status', formData.status);

      fd.append('mentions', JSON.stringify(formData.mentions));

      // Nested objects (stringified)
      fd.append('product', JSON.stringify(formData.product));
      fd.append('settings', JSON.stringify(formData.settings));

    const response = await axios.post('/posts/create/product', fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  /*
  export const createServicePost = async (serviceData: any) => {
    const formData = buildFormData(serviceData);
    const response = await axios.post('/posts/create/service', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };
  
  export const createBusinessPost = async (businessData: any) => {
    const formData = buildFormData(businessData);
    const response = await axios.post('/posts/create/business', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };
  */
  
  