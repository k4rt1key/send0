import {
  ServerResponse,
  UploadData,
  UploadInputData,
} from '@/lib/types'

import axios from 'axios'

export async function uploadFiles(
  data: UploadInputData
): Promise<ServerResponse> {
  
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('text', data.text);
  formData.append('password', data.password);
  formData.append('expiryTime', data.expiryTime.toString());
  data.files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await axios.post('/api/v1/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    validateStatus: () => true,
  });

  // Return response directly without using Promise.resolve/reject
  if (response.data.success) {
    return {
      success: true,
      message: "Content uploaded successfully",
      data: response.data.data,
      statusCode: response.status,
    };
  }

  return {
    success: false,
    message: response.data.message,
    data: [],
    statusCode: response.status,
  };
}

export async function getSharedContent(
  name: string,
  password?: string
): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data: UploadData | [];
}> {

  const formData = new FormData();
  formData.append('name', name);
  if (password) {
    formData.append('password', password);
  }

  const response = await axios.post(`/api/v1/getObject`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    validateStatus: () => true,
  });

  // Return response directly without using Promise.resolve/reject
  if (response.data.success) {
    return {
      success: true,
      message: "Content fetched successfully",
      data: response.data.data,
      statusCode: response.status,
    };
  }

  return {
    success: false,
    message: response.data.message,
    data: [],
    statusCode: response.status,
  };
}
