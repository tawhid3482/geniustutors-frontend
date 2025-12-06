import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateReview: builder.mutation({
      query: (formData) => {
        return {
          url: "/review/create/textReview",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.review],
    }),
    CreateVideoReview: builder.mutation({
      query: (formData) => {
        return {
          url: "/review/create/videoReview",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.review],
    }),

    GetAllReview: builder.query({
      query: () => ({
        url: "/review",
        method: "GET",
      }),
      providesTags: [tagTypes.review],
    }),

    GetAllReviewByRole: builder.query({
      query: ({ id }) => ({
        url: `/review/user/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.review],
    }),

    UpdateReview: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/review/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.review],
    }),

    DeleteReview: builder.mutation({
      query: (id: string) => ({
        url: `/review/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.review],
    }),
  }),
});

export const {
useCreateReviewMutation,
useCreateVideoReviewMutation,
useGetAllReviewByRoleQuery,
useGetAllReviewQuery,
useUpdateReviewMutation,
useDeleteReviewMutation
} = reviewApi;
