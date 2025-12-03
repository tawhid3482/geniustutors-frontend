import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const NoteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateNote: builder.mutation({
      query: (formData) => {
        return {
          url: "/note/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.Note],
    }),

    GetAllNote: builder.query({
      query: () => ({
        url: "/note",
        method: "GET",
      }),
      providesTags: [tagTypes.Note],
    }),

    GetAllNoteUser: builder.query({
      query: ({ id }) => ({
        url: `/note/user/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.Note],
    }),

    UpdateNote: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/note/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.Note],
    }),

    DeleteNote: builder.mutation({
      query: (id: string) => ({
        url: `/note/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.Note],
    }),
  }),
});

export const {
  useCreateNoteMutation,
  useGetAllNoteQuery,
  useDeleteNoteMutation,
  useUpdateNoteMutation,
  useGetAllNoteUserQuery,
} = NoteApi;
