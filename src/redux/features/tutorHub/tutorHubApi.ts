import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const TutorHubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getAllTutorHubStats: builder.query({
      query: () => ({
        url: "/tutor-hub/stats",
        method: "GET",
      }),
      providesTags: [tagTypes.TutorHub],
    }),

    getAllTutors: builder.query({
      query: () => ({
        url: "/tutor-hub/tutors",
        method: "GET",
      }),
      providesTags: [tagTypes.TutorHub],
    }),

  getAllTutorHubSearch: builder.query({
  query: (searchQuery: string) => ({
    url: `/tutor-hub/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
    method: "GET",
  }),
  providesTags: [tagTypes.TutorHub],
}),

  getAllTutorHubByCategory: builder.query({
  query: (searchQuery: string) => ({
    url: `/tutor-hub/category${searchQuery ? `?category=${encodeURIComponent(searchQuery)}` : ''}`,
    method: "GET",
  }),
  providesTags: [tagTypes.TutorHub],
}),

  getSingleTutorHub: builder.query({
  query: (tutorId: string) => ({
    url: `/tutor-hub/${tutorId}`,
    method: "GET",
  }),
  providesTags: [tagTypes.TutorHub],
}),
    
    UpdateTutorStatus: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/tutor-hub/tutor-status/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.TutorHub],
    }),

    // deleteTutorHub: builder.mutation({
    //   query: (id: string) => ({
    //     url: `/categories/delete/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: [tagTypes.TutorHub],
    // }),
  }),
});

export const {
useGetAllTutorHubSearchQuery,
useGetAllTutorHubStatsQuery,
useGetAllTutorHubByCategoryQuery,
useGetSingleTutorHubQuery,
useGetAllTutorsQuery,
useUpdateTutorStatusMutation
} = TutorHubApi;