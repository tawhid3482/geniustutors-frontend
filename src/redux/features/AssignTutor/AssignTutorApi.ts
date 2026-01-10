import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const assignTutorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateassignTutor: builder.mutation({
      query: (formData) => {
        return {
          url: "/assignTutor/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.assignTutor],
    }),

    GetAllassignTutor: builder.query({
      query: () => ({
        url: "/assignTutor",
        method: "GET",
      }),
      providesTags: [tagTypes.assignTutor],
    }),
    getAllTutorDue: builder.query({
      query: (id:string) => ({
        url: `/assignTutor/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.assignTutor],
    }),

    GetAllAssignTutorByRole: builder.query({
      query: (id:string) => ({
        url: `/assignTutor/tutor/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.assignTutor],
    }),

    GetAllAssignPlatformFee: builder.query({
      query: (id:string) => ({
        url: `/assignTutor/platformFee/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.assignTutor],
    }),

    UpdateAssignTutor: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/assignTutor/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.assignTutor],
    }),

    UpdateAssignTutorPlatformFee: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/assignTutor/platformFee-update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.assignTutor],
    }),

    DeleteassignTutor: builder.mutation({
      query: (id: string) => ({
        url: `/assignTutor/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.assignTutor],
    }),
  }),
});

export const {

    useCreateassignTutorMutation,
    useDeleteassignTutorMutation,
    useGetAllAssignPlatformFeeQuery,
    useGetAllAssignTutorByRoleQuery,
    useGetAllassignTutorQuery,
    useUpdateAssignTutorMutation,
    useUpdateAssignTutorPlatformFeeMutation,
    useGetAllTutorDueQuery

} = assignTutorApi;
