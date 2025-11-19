import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const tutorRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTutorRequests: builder.mutation({
      query: (formData) => {
        return {
          url: "/tutor-requests/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.tutorRequests],
    }),

    getAllTutorRequests: builder.query({
      query: () => ({
        url: "/tutor-requests",
        method: "GET",
      }),
      providesTags: [tagTypes.tutorRequests],
    }),
    getSingleTutorRequest: builder.query({
      query: (id: string) => ({
        url: `/tutor-requests/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.tutorRequests],
    }),
    updateTutorRequests: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/tutor-requests/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.tutorRequests],
    }),

    deleteTutorRequests: builder.mutation({
      query: (id: string) => ({
        url: `/tutor-requests/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.tutorRequests],
    }),
  }),
});

export const {
  useCreateTutorRequestsMutation,
  useDeleteTutorRequestsMutation,
  useGetAllTutorRequestsQuery,
  useUpdateTutorRequestsMutation,
  useGetSingleTutorRequestQuery
} = tutorRequestsApi;
