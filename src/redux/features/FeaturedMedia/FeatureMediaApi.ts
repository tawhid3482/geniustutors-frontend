import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const FeatureMediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createFeatureMedia: builder.mutation({
      query: (formData) => {
        return {
          url: "/website-management/featured-media/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.FeatureMedia],
    }),

    getAllFeatureMedia: builder.query({
      query: () => ({
        url: "/website-management/featured-media/public",
        method: "GET",
      }),
      providesTags: [tagTypes.FeatureMedia],
    }),
    
    updateFeatureMedia: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/website-management/featured-media/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.FeatureMedia],
    }),

    deleteFeatureMedia: builder.mutation({
      query: (id: string) => ({
        url: `/website-management/featured-media/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.FeatureMedia],
    }),
  }),
});

export const {
useGetAllFeatureMediaQuery
} = FeatureMediaApi;