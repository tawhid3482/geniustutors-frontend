import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const SetPlatformFeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateSetPlatformFee: builder.mutation({
      query: (formData) => {
        return {
          url: "/SetPlatformFee/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.SetPlatformFee],
    }),

    GetAllSetPlatformFee: builder.query({
      query: () => ({
        url: "/SetPlatformFee",
        method: "GET",
      }),
      providesTags: [tagTypes.SetPlatformFee],
    }),

    UpdateSetPlatformFee: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/SetPlatformFee/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.SetPlatformFee],
    }),

    DeleteSetPlatformFee: builder.mutation({
      query: (id: string) => ({
        url: `/SetPlatformFee/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.SetPlatformFee],
    }),
  }),
});

export const {
  useCreateSetPlatformFeeMutation,
  useDeleteSetPlatformFeeMutation,
  useGetAllSetPlatformFeeQuery,
  useUpdateSetPlatformFeeMutation,
} = SetPlatformFeeApi;
