import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const ChatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createChat: builder.mutation({
      query: (formData) => {
        return {
          url: "/categories/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.Chat],
    }),

    getAllChat: builder.query({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      providesTags: [tagTypes.Chat],
    }),
    
    updateChat: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/categories/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.Chat],
    }),

    deleteChat: builder.mutation({
      query: (id: string) => ({
        url: `/categories/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.Chat],
    }),
  }),
});

export const {
useCreateChatMutation,
useGetAllChatQuery,
useDeleteChatMutation,
useUpdateChatMutation
} = ChatApi;