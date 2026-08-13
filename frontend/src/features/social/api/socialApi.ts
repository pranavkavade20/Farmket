import { apiSlice } from '@/app/api/apiSlice';

export const socialApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<unknown, string | void>({
      query: (cursor) => (cursor ? `posts/feed/?cursor=${cursor}` : 'posts/feed/'),
      providesTags: ['Post'] as never[],
    }),
    createPost: builder.mutation<unknown, FormData>({
      query: (data) => ({
        url: 'posts/feed/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    updatePost: builder.mutation<unknown, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `posts/feed/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    getMyPosts: builder.query<unknown, void>({
      query: () => 'posts/feed/my_posts/',
      providesTags: ['Post'] as never[],
    }),
    likePost: builder.mutation<unknown, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/like/`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    unlikePost: builder.mutation<unknown, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/like/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    savePost: builder.mutation<unknown, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/save_post/`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    unsavePost: builder.mutation<unknown, number>({
      query: (postId) => ({
        url: `posts/feed/${postId}/save_post/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'] as never[],
    }),
    getComments: builder.query<unknown, number>({
      query: (postId) => `posts/comments/?post_id=${postId}`,
      providesTags: (_result, _error, postId) => [{ type: 'Comment', id: postId }] as never[],
    }),
    addComment: builder.mutation<unknown, { post: number; content: string; parent?: number }>({
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
