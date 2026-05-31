import { apiSlice } from '@/app/api/apiSlice';
import type { CropGrowth, CropReservation } from '@/types/crops';

export const cropsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCrops: builder.query<CropGrowth[], void>({
      query: () => '/crops/',
      transformResponse: (response: { results: CropGrowth[] } | CropGrowth[]) =>
        Array.isArray(response) ? response : response.results,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Crop' as const, id })),
              { type: 'Crop', id: 'LIST' },
            ]
          : [{ type: 'Crop', id: 'LIST' }],
    }),
    getUpcomingHarvests: builder.query<CropGrowth[], void>({
      query: () => '/crops/upcoming/',
      transformResponse: (response: { results: CropGrowth[] } | CropGrowth[]) =>
        Array.isArray(response) ? response : response.results,
      providesTags: [{ type: 'Crop', id: 'LIST' }],
    }),
    getCropDetails: builder.query<CropGrowth, number>({
      query: (id) => `/crops/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Crop', id }],
    }),
    createCrop: builder.mutation<CropGrowth, Partial<CropGrowth>>({
      query: (initialCrop) => ({
        url: '/crops/',
        method: 'POST',
        body: initialCrop,
      }),
      invalidatesTags: [{ type: 'Crop', id: 'LIST' }],
    }),
    updateCropStage: builder.mutation<CropGrowth, { id: number; stage: string; remarks?: string }>({
      query: ({ id, ...patch }) => ({
        url: `/crops/${id}/update_stage/`,
        method: 'POST',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Crop', id }, { type: 'Crop', id: 'LIST' }],
    }),
    reserveCrop: builder.mutation<CropReservation, { id: number; quantity: number; expected_delivery_date?: string }>({
      query: ({ id, ...patch }) => ({
        url: `/crops/${id}/reserve/`,
        method: 'POST',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Crop', id }, { type: 'Crop', id: 'LIST' }, { type: 'Reservation', id: 'LIST' }],
    }),
    followCrop: builder.mutation<void, number>({
      query: (id) => ({
        url: `/crops/${id}/follow/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Crop', id }],
    }),
    unfollowCrop: builder.mutation<void, number>({
      query: (id) => ({
        url: `/crops/${id}/unfollow/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Crop', id }],
    }),
    getReservations: builder.query<CropReservation[], void>({
      query: () => '/crops/reservations/',
      transformResponse: (response: { results: CropReservation[] } | CropReservation[]) =>
        Array.isArray(response) ? response : response.results,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Reservation' as const, id })),
              { type: 'Reservation', id: 'LIST' },
            ]
          : [{ type: 'Reservation', id: 'LIST' }],
    }),
    approveReservation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/crops/reservations/${id}/approve/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Reservation', id }, { type: 'Crop', id: 'LIST' }],
    }),
    rejectReservation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/crops/reservations/${id}/reject/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Reservation', id }, { type: 'Crop', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCropsQuery,
  useGetUpcomingHarvestsQuery,
  useGetCropDetailsQuery,
  useCreateCropMutation,
  useUpdateCropStageMutation,
  useReserveCropMutation,
  useFollowCropMutation,
  useUnfollowCropMutation,
  useGetReservationsQuery,
  useApproveReservationMutation,
  useRejectReservationMutation,
} = cropsApi;
