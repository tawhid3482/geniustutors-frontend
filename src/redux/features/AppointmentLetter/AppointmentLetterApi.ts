import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const AppointmentLetterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendAppointmentToStudent: builder.mutation({
      query: (formData) => {
        return {
          url: "/appointment/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.AppointmentLetter],
    }),

    GetAllAppointmentLetterForAdmin: builder.query({
      query: () => ({
        url: "/appointment",
        method: "GET",
      }),
      providesTags: [tagTypes.AppointmentLetter],
    }),

    GetAllAppointmentLetter: builder.query({
      query: (id:string) => ({
        url: `/appointment/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.AppointmentLetter],
    }),



    UpdateAppointmentLetter: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/appointment/update/${id}`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: [tagTypes.AppointmentLetter],
    }),


    DeleteAppointmentLetter: builder.mutation({
      query: (id: string) => ({
        url: `/appointment/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.AppointmentLetter],
    }),
  }),
});

export const {

    useSendAppointmentToStudentMutation,
    useDeleteAppointmentLetterMutation,
   useGetAllAppointmentLetterForAdminQuery,
    useGetAllAppointmentLetterQuery,
    useUpdateAppointmentLetterMutation,

} = AppointmentLetterApi;
