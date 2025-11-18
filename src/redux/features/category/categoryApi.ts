import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (formData) => {
        return {
          url: "/categories/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.category],
    }),

    getAllCategory: builder.query({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      providesTags: [tagTypes.category],
    }),
    
    updateCategory: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/categories/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.category],
    }),

    deleteCategory: builder.mutation({
      query: (id: string) => ({
        url: `/categories/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.category],
    }),
  }),
});

export const {
useCreateCategoryMutation,
useGetAllCategoryQuery,
useDeleteCategoryMutation,
useUpdateCategoryMutation
} = categoryApi;