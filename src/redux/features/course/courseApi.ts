import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const CourseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateCourse: builder.mutation({
      query: (formData) => {
        return {
          url: "/course/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.Course],
    }),

    GetAllCourse: builder.query({
      query: () => ({
        url: "/course",
        method: "GET",
      }),
      providesTags: [tagTypes.Course],
    }),

    GetAllCourseUser: builder.query({
      query: ({ id }) => ({
        url: `/course/user/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.Course],
    }),

    UpdateCourse: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/course/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.Course],
    }),

    DeleteCourse: builder.mutation({
      query: (id: string) => ({
        url: `/course/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.Course],
    }),
  }),
});

export const {
  useCreateCourseMutation,
  useGetAllCourseQuery,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
  useGetAllCourseUserQuery,
} = CourseApi;
