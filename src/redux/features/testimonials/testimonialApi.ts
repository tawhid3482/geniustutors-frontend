import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const testimonialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTestimonial: builder.mutation({
      query: (formData) => {
        return {
          url: "/testimonials/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.testimonial],
    }),

    getAllTestimonial: builder.query({
      query: () => ({
        url: "/testimonials",
        method: "GET",
      }),
      providesTags: [tagTypes.testimonial],
    }),
    getAllTestimonialForAdmin: builder.query({
      query: (id:string) => ({
        url: `/testimonials/admin/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.testimonial],
    }),
    
    updateTestimonial: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/testimonials/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.testimonial],
    }),

    deleteTestimonial: builder.mutation({
      query: (id: string) => ({
        url: `/testimonials/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.testimonial],
    }),
  }),
});

export const {
useGetAllTestimonialQuery,
useCreateTestimonialMutation,
useDeleteTestimonialMutation,
useUpdateTestimonialMutation,
useGetAllTestimonialForAdminQuery
} = testimonialApi;