import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateNotification: builder.mutation({
      query: (formData) => {
        return {
          url: "/notification/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.notification],
    }),

    GetAllNotification: builder.query({
      query: () => ({
        url: "/notification",
        method: "GET",
      }),
      providesTags: [tagTypes.notification],
    }),

    GetAllNotificationByRole: builder.query({
      query: ({ id }) => ({
        url: `/notification/user/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.notification],
    }),

    UpdateNotification: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/notification/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.notification],
    }),

    DeleteNotification: builder.mutation({
      query: (id: string) => ({
        url: `/notification/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.notification],
    }),
  }),
});

export const {
useCreateNotificationMutation,
useGetAllNotificationByRoleQuery,
useDeleteNotificationMutation,
useGetAllNotificationQuery,
useUpdateNotificationMutation
} = notificationApi;
