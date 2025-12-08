import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTransaction: builder.mutation({
      query: (formData) => {
        return {
          url: "/transaction/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.transaction],
    }),

    getAllTransaction: builder.query({
      query: () => ({
        url: "/transaction/admin",
        method: "GET",
      }),
      providesTags: [tagTypes.transaction],
    }),
    // getAllTransactionForAdmin: builder.query({
    //   query: (id:string) => ({
    //     url: `/transactions/admin/${id}`,
    //     method: "GET",
    //   }),
    //   providesTags: [tagTypes.transaction],
    // }),
    
    updateTransaction: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/transaction/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.transaction],
    }),

    deleteTransaction: builder.mutation({
      query: (id: string) => ({
        url: `/transaction/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.transaction],
    }),
  }),
});

export const {
useGetAllTransactionQuery,
useUpdateTransactionMutation,
useDeleteTransactionMutation,
useCreateTransactionMutation
} = transactionApi;