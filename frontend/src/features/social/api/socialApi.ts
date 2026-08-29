import { apiSlice } from '@/app/api/apiSlice';
import type { Post, PaginatedResponse } from '@/types';

export interface Comment {
  id: number;
  post: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
  parent?: number | null;
  content: string;
  created_at: string;
  replies_count?: number;
}

export const socialApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<PaginatedResponse<Post>, string | void>({
      query: (cursor) => (cursor ? `posts/feed/?cursor=${cursor}` : 'posts/feed/'),
      providesTags: ['Post'] as never[],
    }),
    createPost: builder.mutation<Post, FormData>({
      query: (data) => ({
        url: 'posts/feed/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    updatePost: builder.mutation<Post, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `posts/feed/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    getMyPosts: builder.query<PaginatedResponse<Post>, void>({
      query: () => 'posts/feed/my_posts/',
      providesTags: ['Post'] as never[],
    }),
    likePost: builder.mutation<{ is_liked: boolean }, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/like/`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    unlikePost: builder.mutation<void, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/like/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    savePost: builder.mutation<{ is_saved: boolean }, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/save_post/`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    unsavePost: builder.mutation<void, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/save_post/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    getComments: builder.query<Comment[], number>({
      query: (postId) => `posts/comments/?post_id=${postId}`,
      providesTags: (_result, _error, postId) => [{ type: 'Comment', id: postId }] as never[],
    }),
    addComment: builder.mutation<Comment, { post: number; content: string; parent?: number }>({
      query: (data) => ({
        url: 'posts/comments/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { post }) => [{ type: 'Comment', id: post }] as never[],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useGetMyPostsQuery,
  useUpdatePostMutation,
} = socialApi;
