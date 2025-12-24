import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const RefundPolicyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateRefundPolicy: builder.mutation({
      query: (formData) => {
        return {
          url: "/refundPolicy/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.RefundPolicy],
    }),

    GetAllRefundPolicy: builder.query({
      query: () => ({
        url: "/refundPolicy",
        method: "GET",
      }),
      providesTags: [tagTypes.RefundPolicy],
    }),

  

    UpdateRefundPolicy: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/refundPolicy/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.RefundPolicy],
    }),

    DeleteRefundPolicy: builder.mutation({
      query: (id: string) => ({
        url: `/refundPolicy/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.RefundPolicy],
    }),
  }),
});

export const {

    useCreateRefundPolicyMutation,
    useDeleteRefundPolicyMutation,
    useGetAllRefundPolicyQuery,
    useUpdateRefundPolicyMutation

} = RefundPolicyApi;
