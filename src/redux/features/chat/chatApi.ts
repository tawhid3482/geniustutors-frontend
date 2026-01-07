import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const ChatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createConversation: builder.mutation({
      query: (formData) => {
        return {
          url: "/chat/conversation",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.Chat],
    }),

    getUserConversations: builder.query({
      query: (id: string) => ({
        url: `/chat/conversations/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.Chat],
    }),

    getConversationById: builder.query({
      query: (id: string) => ({
        url: `/chat/conversations/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.Chat],
    }),

    getAllMessages: builder.query({
      query: (id: string) => ({
        url: `/chat/messages/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.Chat],
    }),

    getOrCreateConversation: builder.query({
      query: ({ userId1, userId2 }: { userId1: string; userId2: string }) => ({
        url: `/chat/get-or-create/${userId1}/${userId2}`,
        method: "GET",
      }),
      providesTags: [tagTypes.Chat],
    }),

    checkConversation: builder.query({
      query: ({ userId1, userId2 }: { userId1: string; userId2: string }) => ({
        url: `/chat/check/${userId1}/${userId2}`,
        method: "GET",
      }),
      providesTags: [tagTypes.Chat],
    }),

    createMessage: builder.mutation({
      query: (formData) => {
        return {
          url: "/chat/message",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.Chat],
    }),

    updateMessage: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/chat/message/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.Chat],
    }),

    deleteMessage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/chat/message/${id}`,
        method: "DELETE",
        data: data,
      }),
      invalidatesTags: [tagTypes.Chat],
    }),
  }),
});

export const {
  useCreateConversationMutation,
  useCheckConversationQuery,
  useCreateMessageMutation,
  useDeleteMessageMutation,
  useGetAllMessagesQuery,
  useGetConversationByIdQuery,
  useGetOrCreateConversationQuery,
  useGetUserConversationsQuery,
  useUpdateMessageMutation,
  
} = ChatApi;
