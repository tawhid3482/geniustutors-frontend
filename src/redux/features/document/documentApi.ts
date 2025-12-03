import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const DocumentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateDocument: builder.mutation({
      query: (formData) => {
        return {
          url: "/document/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.Document],
    }),

    GetAllDocument: builder.query({
      query: () => ({
        url: "/document",
        method: "GET",
      }),
      providesTags: [tagTypes.Document],
    }),

    GetAllDocumentUser: builder.query({
      query: ({ id }) => ({
        url: `/document/user/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.Document],
    }),

    UpdateDocument: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/document/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.Document],
    }),

    DeleteDocument: builder.mutation({
      query: (id: string) => ({
        url: `/document/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.Document],
    }),
  }),
});

export const {
  useCreateDocumentMutation,
  useGetAllDocumentQuery,
  useDeleteDocumentMutation,
  useUpdateDocumentMutation,
  useGetAllDocumentUserQuery,
} = DocumentApi;
