import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAuth: builder.mutation({
      query: (formData) => {
        return {
          url: "/auth/register",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.auth],
    }),
    createStudentOrGuardian: builder.mutation({
      query: (formData) => {
        return {
          url: "/auth/register/user",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.auth],
    }),

    checkPhoneNumber: builder.mutation({
      query: (data) => {
        return {
          url: "/auth/check-phone",
          method: "POST",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.auth],
    }),

    getAllAuth: builder.query({
      query: () => ({
        url: "/auth",
        method: "GET",
      }),
      providesTags: [tagTypes.auth],
    }),
    getSingleAuthData: builder.query({
      query: (id: string) => ({
        url: `/auth/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.auth],
    }),
    updateAuth: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/auth/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.auth],
    }),

    deleteAuth: builder.mutation({
      query: (id: string) => ({
        url: `/auth/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.auth],
    }),
  }),
});

export const {
useCreateAuthMutation,
useDeleteAuthMutation,
useGetAllAuthQuery,
useGetSingleAuthDataQuery,
useUpdateAuthMutation,
useCheckPhoneNumberMutation,
useCreateStudentOrGuardianMutation
} = authApi;
