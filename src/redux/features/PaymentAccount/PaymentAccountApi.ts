import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const PaymentAccountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreatePaymentAccount: builder.mutation({
      query: (formData) => {
        return {
          url: "/account/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.PaymentAccount],
    }),

    GetAllPaymentAccount: builder.query({
      query: () => ({
        url: "/account",
        method: "GET",
      }),
      providesTags: [tagTypes.PaymentAccount],
    }),

  

    UpdatePaymentAccount: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/account/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.PaymentAccount],
    }),

    DeletePaymentAccount: builder.mutation({
      query: (id: string) => ({
        url: `/account/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.PaymentAccount],
    }),
  }),
});

export const {

    useCreatePaymentAccountMutation,
    useDeletePaymentAccountMutation,
    useGetAllPaymentAccountQuery,
    useUpdatePaymentAccountMutation

} = PaymentAccountApi;
