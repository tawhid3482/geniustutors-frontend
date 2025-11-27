import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const upgradePackagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateUpgradePackages: builder.mutation({
      query: (formData) => {
        return {
          url: "/upgrade-packages/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.upgradePackages],
    }),

    GetAllUpgradePackages: builder.query({
      query: () => ({
        url: "/upgrade-packages",
        method: "GET",
      }),
      providesTags: [tagTypes.upgradePackages],
    }),
  
    UpdateUpgradePackages: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/upgrade-packages/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.upgradePackages],
    }),

    DeleteUpgradePackages: builder.mutation({
      query: (id: string) => ({
        url: `/upgrade-packages/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.upgradePackages],
    }),
  }),
});

export const {
    useCreateUpgradePackagesMutation,
    useGetAllUpgradePackagesQuery,
    useDeleteUpgradePackagesMutation,
    useUpdateUpgradePackagesMutation

} = upgradePackagesApi;