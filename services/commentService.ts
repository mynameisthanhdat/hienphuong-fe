import axios from 'axios';

export interface CommentItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CommentApiResponse {
  success?: boolean;
  data?: CommentItem[];
}

export interface CreateCommentPayload {
  name: string;
  rating: number;
  comment: string;
}

const publicApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim() || undefined,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

const commentsApiUrl = '/api/comments';

export const getComments = async (): Promise<CommentItem[]> => {
  const response = await publicApiClient.get<CommentApiResponse | CommentItem[]>(commentsApiUrl);
  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload.data) ? payload.data : [];
};

export const createComment = async (payload: CreateCommentPayload) => {
  const response = await publicApiClient.post(commentsApiUrl, payload);
  return response.data;
};

export const updateComment = async (commentId: string, payload: CreateCommentPayload) => {
  const response = await publicApiClient.put(`${commentsApiUrl}/${commentId}`, payload);
  return response.data;
};

export const deleteComment = async (commentId: string) => {
  const response = await publicApiClient.delete(`${commentsApiUrl}/${commentId}`);
  return response.data;
};
