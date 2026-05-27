import { fetchWithAuth } from './auth.api';

export const mediaApi = {
  getPresignedUrl: (data: { filename: string; contentType: string }) =>
    fetchWithAuth<{ presignedUrl: string; url: string }>(
      `/media/images/upload/presigned-url`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
};
