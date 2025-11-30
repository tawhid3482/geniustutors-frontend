import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const noticeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateNotice: builder.mutation({
      query: (formData) => {
        return {
          url: "/notice/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.notice],
    }),

    GetAllNotice: builder.query({
      query: () => ({
        url: "/notice",
        method: "GET",
      }),
      providesTags: [tagTypes.notice],
    }),
  
    UpdateNotice: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/notice/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.notice],
    }),

    DeleteNotice: builder.mutation({
      query: (id: string) => ({
        url: `/notice/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.notice],
    }),
  }),
});

export const {
    useCreateNoticeMutation,
    useGetAllNoticeQuery,
    useDeleteNoticeMutation,
    useUpdateNoticeMutation

} = noticeApi;