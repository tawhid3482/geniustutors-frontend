import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreatePayment: builder.mutation({
      query: (formData) => {
        return {
          url: "/transaction/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.payment],
    }),

    GetAllPayment: builder.query({
      query: () => ({
        url: "/transaction",
        method: "GET",
      }),
      providesTags: [tagTypes.payment],
    }),

    GetAllPaymentByRole: builder.query({
      query: (id:string) => ({
        url: `/transaction/tutor-pay/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.payment],
    }),

    UpdatePayment: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/transaction/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.payment],
    }),

    DeletePayment: builder.mutation({
      query: (id: string) => ({
        url: `/transaction/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.payment],
    }),
  }),
});

export const {

    useCreatePaymentMutation,
    useDeletePaymentMutation,
    useGetAllPaymentByRoleQuery,
    useGetAllPaymentQuery,
    useUpdatePaymentMutation

} = paymentApi;
