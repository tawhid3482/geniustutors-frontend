import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const videoVideoTestimonialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createVideoTestimonial: builder.mutation({
      query: (formData) => {
        return {
          url: "/video-testimonials/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.VideoTestimonial],
    }),

    getAllVideoTestimonial: builder.query({
      query: () => ({
        url: "/video-testimonials",
        method: "GET",
      }),
      providesTags: [tagTypes.VideoTestimonial],
    }),

    getAllVideoTestimonialForAdmin: builder.query({
      query: (id: string) => ({
        url: `/video-testimonials/admin/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.VideoTestimonial],
    }),

    updateVideoTestimonial: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/video-testimonials/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.VideoTestimonial],
    }),

    deleteVideoTestimonial: builder.mutation({
      query: (id: string) => ({
        url: `/video-testimonials/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.VideoTestimonial],
    }),
  }),
});

export const {
  useGetAllVideoTestimonialQuery,
  useCreateVideoTestimonialMutation,
  useGetAllVideoTestimonialForAdminQuery,
  useUpdateVideoTestimonialMutation,
  useDeleteVideoTestimonialMutation,
} = videoVideoTestimonialApi;
