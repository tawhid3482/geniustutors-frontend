import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const applyForTutorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createapplyForTutor: builder.mutation({
      query: (formData) => {
        return {
          url: "/applyForTutor/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.applyForTutor],
    }),

    getAllapplyForTutor: builder.query({
      query: () => ({
        url: "/applyForTutor",
        method: "GET",
      }),
      providesTags: [tagTypes.applyForTutor],
    }),
    
    getAllApplyForTutors: builder.query({
      query: (id:string) => ({
        url: `/applyForTutor/tutor/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.applyForTutor],
    }),
    
    updateapplyForTutor: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/applyForTutor/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.applyForTutor],
    }),

    deleteapplyForTutor: builder.mutation({
      query: (id: string) => ({
        url: `/applyForTutor/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.applyForTutor],
    }),
  }),
});

export const {
useCreateapplyForTutorMutation,
useGetAllapplyForTutorQuery,
useUpdateapplyForTutorMutation,
useDeleteapplyForTutorMutation,
useGetAllApplyForTutorsQuery
} = applyForTutorApi;