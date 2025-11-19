import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const TutorHubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // createTutorHub: builder.mutation({
    //   query: (formData) => {
    //     return {
    //       url: "/tutor-hub/create",
    //       method: "POST",
    //       data: formData,
    //     };
    //   },
    //   invalidatesTags: [tagTypes.TutorHub],
    // }),

    getAllTutorHubStats: builder.query({
      query: () => ({
        url: "/tutor-hub/stats",
        method: "GET",
      }),
      providesTags: [tagTypes.TutorHub],
    }),
    
    // updateTutorHub: builder.mutation({
    //   query: ({ id, data }) => {
    //     return {
    //       url: `/categories/update/${id}`,
    //       method: "PATCH",
    //       data: data,
    //     };
    //   },
    //   invalidatesTags: [tagTypes.TutorHub],
    // }),

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
useGetAllTutorHubStatsQuery
} = TutorHubApi;