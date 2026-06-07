import { apiSlice } from '@/app/api/apiSlice';

export const socialApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<any, string | void>({
      query: (cursor) => (cursor ? `posts/feed/?cursor=${cursor}` : 'posts/feed/'),
      providesTags: ['Post'] as any,
    }),
    createPost: builder.mutation<any, FormData>({
      query: (data) => ({
        url: 'posts/feed/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'] as any,
    }),
    updatePost: builder.mutation<any, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `posts/feed/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Post'] as any,
    }),
    getMyPosts: builder.query<any, void>({
      query: () => 'posts/feed/my_posts/',
      providesTags: ['Post'] as any,
    }),
    likePost: builder.mutation<any, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/like/`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'] as any,
    }),
    unlikePost: builder.mutation<any, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/like/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'] as any,
    }),
    savePost: builder.mutation<any, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/save_post/`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'] as any,
    }),
    unsavePost: builder.mutation<any, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/save_post/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'] as any,
    }),
    getComments: builder.query<any, number>({
      query: (postId) => `posts/comments/?post_id=${postId}`,
      providesTags: (result, error, postId) => [{ type: 'Comment', id: postId }] as any,
    }),
    addComment: builder.mutation<any, { post: number; content: string; parent?: number }>({
      query: (data) => ({
        url: 'posts/comments/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { post }) => [{ type: 'Comment', id: post }] as any,
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
