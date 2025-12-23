import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const applicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateStatusApplication: builder.mutation({
      query: (formData) => {
        return {
          url: `/application/status/${formData.id}`,
          method: "PATCH",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.application],
    }),

    getAllapplication: builder.query({
      query: () => ({
        url: "/application",
        method: "GET",
      }),
      providesTags: [tagTypes.application],
    }),



    getAllapplicationTutors: builder.query({
      query: () => ({
        url: "/application/application-tutors",
        method: "GET",
      }),
      providesTags: [tagTypes.application],
    }),

    updateapplication: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/application/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.application],
    }),

    deleteapplication: builder.mutation({
      query: (id: string) => ({
        url: `/application/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.application],
    }),

    getAllTutorsApplication: builder.query({
      query: (id: string) => ({
        url: `/application/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.application],
    }),



  }),
});

export const {
  useUpdateStatusApplicationMutation,
  useDeleteapplicationMutation,
  useGetAllapplicationQuery,
  useUpdateapplicationMutation,
  useGetAllapplicationTutorsQuery,
  useGetAllTutorsApplicationQuery
} = applicationApi;
