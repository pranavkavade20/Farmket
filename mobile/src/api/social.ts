import { apiClient } from './client';
import type { Product } from './products';
import { resolveMediaUrl } from './config';

export interface PostMedia {
  id: number;
  type: 'image' | 'video';
  file: string;
  thumbnail?: string;
  order?: number;
}

export interface PostAuthor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  user_type: string;
  farm_name?: string;
}

export interface Comment {
  id: number;
  post: number;
  user: PostAuthor;
  parent?: number | null;
  content: string;
  created_at: string;
  replies_count?: number;
}

export interface Post {
  id: number;
  farmer: PostAuthor;
  product?: Product;
  category?: number;
  title?: string;
  description: string;
  location?: string;
  hashtags?: string[];
  visibility?: string;
  status?: string;
  is_pinned?: boolean;
  created_at: string;
  updated_at?: string;
  media: PostMedia[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_saved: boolean;
}

export interface FeedResponse {
  count?: number;
  next: string | null;
  previous: string | null;
  results: Post[];
}

const normalizePostMedia = (post: Post): Post => {
  if (post.farmer?.profile_picture) {
    post.farmer.profile_picture = resolveMediaUrl(post.farmer.profile_picture) || post.farmer.profile_picture;
  }
  if (post.media && Array.isArray(post.media)) {
    post.media = post.media.map((m) => ({
      ...m,
      file: resolveMediaUrl(m.file) || m.file,
      thumbnail: resolveMediaUrl(m.thumbnail) || m.thumbnail,
    }));
  }
  return post;
};

export const fetchFeed = async (pageParam: string = 'posts/feed/'): Promise<FeedResponse> => {
  let url = pageParam;
  if (url.startsWith('http')) {
    const parsed = new URL(url);
    url = (parsed.pathname + parsed.search).replace(/^\/?api\//, '');
  } else if (url.startsWith('/api/')) {
    url = url.replace(/^\/?api\//, '');
  }
  const response = await apiClient.get<FeedResponse | Post[]>(url);
  if (Array.isArray(response.data)) {
    return {
      next: null,
      previous: null,
      results: response.data.map(normalizePostMedia),
    };
  }
  return {
    ...response.data,
    results: (response.data.results || []).map(normalizePostMedia),
  };
};

export const likePost = async (postId: number): Promise<{ liked: boolean; is_liked: boolean }> => {
  const response = await apiClient.post(`posts/feed/${postId}/like/`);
  return response.data;
};

export const savePost = async (postId: number): Promise<{ saved: boolean; is_saved: boolean }> => {
  const response = await apiClient.post(`posts/feed/${postId}/save_post/`);
  return response.data;
};

export const sharePost = async (postId: number, platform = 'mobile'): Promise<void> => {
  await apiClient.post(`posts/feed/${postId}/share/`, { platform });
};

export const fetchComments = async (postId: number): Promise<Comment[]> => {
  const response = await apiClient.get<Comment[] | { results: Comment[] }>(`posts/comments/?post_id=${postId}`);
  const rawList = Array.isArray(response.data) ? response.data : (response.data.results || []);
  return rawList.map((c) => {
    if (c.user?.profile_picture) {
      c.user.profile_picture = resolveMediaUrl(c.user.profile_picture) || c.user.profile_picture;
    }
    return c;
  });
};

export const addComment = async (postId: number, content: string, parent?: number): Promise<Comment> => {
  const response = await apiClient.post<Comment>('posts/comments/', {
    post: postId,
    content,
    parent,
  });
  return response.data;
};

export const createPost = async (payload: { title?: string; description: string; product_id?: number }): Promise<Post> => {
  const response = await apiClient.post<Post>('posts/feed/', payload);
  return normalizePostMedia(response.data);
};
