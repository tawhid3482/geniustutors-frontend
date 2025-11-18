import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const areaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createArea: builder.mutation({
      query: (formData) => {
        return {
          url: "/area/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.area],
    }),

    getAllArea: builder.query({
      query: () => ({
        url: "/area",
        method: "GET",
      }),
      providesTags: [tagTypes.area],
    }),
    getAllAreaTutors: builder.query({
      query: () => ({
        url: "/area/area-tutors",
        method: "GET",
      }),
      providesTags: [tagTypes.area],
    }),
    
    updateArea: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/area/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.area],
    }),

    deleteArea: builder.mutation({
      query: (id: string) => ({
        url: `/area/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.area],
    }),
  }),
});

export const {
useCreateAreaMutation,
useDeleteAreaMutation,
useGetAllAreaQuery,
useUpdateAreaMutation,
useGetAllAreaTutorsQuery
} = areaApi;