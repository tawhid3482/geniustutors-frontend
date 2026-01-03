import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const EnrollmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateEnrollment: builder.mutation({
      query: (formData) => {
        return {
          url: "/enrollment/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.Enrollment],
    }),

    GetAllEnrollment: builder.query({
      query: () => ({
        url: "/enrollment",
        method: "GET",
      }),
      providesTags: [tagTypes.Enrollment],
    }),

    GetAllEnrollmentUser: builder.query({
      query: ({ id }) => ({
        url: `/enrollment/user/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.Enrollment],
    }),

    UpdateEnrollment: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/enrollment/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.Enrollment],
    }),

    DeleteEnrollment: builder.mutation({
      query: (id: string) => ({
        url: `/enrollment/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.Enrollment],
    }),
  }),
});

export const {
  useCreateEnrollmentMutation,
  useGetAllEnrollmentQuery,
  useDeleteEnrollmentMutation,
  useUpdateEnrollmentMutation,
  useGetAllEnrollmentUserQuery,
} = EnrollmentApi;
