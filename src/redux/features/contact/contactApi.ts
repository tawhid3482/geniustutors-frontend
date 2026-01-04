import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const ContactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    CreateContact: builder.mutation({
      query: (formData) => {
        return {
          url: "/contact/create",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.Contact],
    }),
  }),
});

export const { useCreateContactMutation } = ContactApi;
