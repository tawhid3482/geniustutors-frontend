import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const districtsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createDistricts: builder.mutation({
      query: (formData) => {
        return {
          url: "/districts/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.districts],
    }),

    getAllDistricts: builder.query({
      query: () => ({
        url: "/districts",
        method: "GET",
      }),
      providesTags: [tagTypes.districts],
    }),
    getAllDistrictsJobs: builder.query({
      query: () => ({
        url: "/districts/jobs",
        method: "GET",
      }),
      providesTags: [tagTypes.districts],
    }),
    
    updateDistricts: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/districts/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.districts],
    }),

    deleteDistricts: builder.mutation({
      query: (id: string) => ({
        url: `/districts/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.districts],
    }),
  }),
});

export const {
useCreateDistrictsMutation,
useDeleteDistrictsMutation,
useGetAllDistrictsQuery,
useUpdateDistrictsMutation,
useGetAllDistrictsJobsQuery
} = districtsApi;