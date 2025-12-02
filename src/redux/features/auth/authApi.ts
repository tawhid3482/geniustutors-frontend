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
    loginUser: builder.mutation({
      query: (formData) => {
        return {
          url: "/auth/login",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.auth],
    }),
    loginAdmin: builder.mutation({
      query: (formData) => {
        return {
          url: "/auth/login/admin",
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

    getAllUsers: builder.query({
      query: () => ({
        url: "/auth/users",
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


    deleteAuth: builder.mutation({
      query: (id: string) => ({
        url: `/auth/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.auth],
    }),

    updateUser: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/auth/update/${id}`,
          method: "PATCH",
          data: data,   
        };
      },
      invalidatesTags: [tagTypes.auth],
    }),

    changePassword: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/auth/change-password/${id}`,
          method: "PATCH",
          data: data,   
        };
      },
      invalidatesTags: [tagTypes.auth],
    }),
    
    updateAdminProfile: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/auth/update-admin-profile/${id}`,
          method: "PATCH",
          data: data,   
        };
      },
      invalidatesTags: [tagTypes.auth],
    }),
    updateUserProfile: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/auth/update-user-profile/${id}`,
          method: "PATCH",
          data: data,   
        };
      },
      invalidatesTags: [tagTypes.auth],
    }),
    

  }),
});

export const {
useCreateAuthMutation,
useDeleteAuthMutation,
useGetAllUsersQuery,
useGetSingleAuthDataQuery,
useCheckPhoneNumberMutation,
useCreateStudentOrGuardianMutation,
useLoginAdminMutation,
useLoginUserMutation,
useUpdateUserMutation,
useChangePasswordMutation,
useUpdateAdminProfileMutation,
useUpdateUserProfileMutation,
} = authApi;
