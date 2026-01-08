import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";

const phoneVerifyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
   
    sendOtp: builder.mutation({
      query: (formData) => {
        return {
          url: "/phone-verification/send-otp",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.phoneVerify],
    }),
    verifyOtp: builder.mutation({
      query: (formData) => {
        return {
          url: "/phone-verification/verify-otp",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.phoneVerify],
    }),

    verifyOtpForForgetPassword: builder.mutation({
      query: (formData) => {
        return {
          url: "/phone-verification/verify-otp-forget",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.phoneVerify],
    }),

    resendOtp: builder.mutation({
      query: (formData) => {
        return {
          url: "/phone-verification/resend-otp",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.phoneVerify],
    }),
   
})
   
});

export const {

useSendOtpMutation,
useResendOtpMutation,
useVerifyOtpMutation,
useVerifyOtpForForgetPasswordMutation
} = phoneVerifyApi;
