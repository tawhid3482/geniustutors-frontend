import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig, AxiosError } from "axios";
import { instance as axiosInstance } from "./axiosInstance";

export const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string } = { baseUrl: "" }): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
      contentType?: string;
    },
    unknown,
    unknown
  > =>
  async ({ url, method = "GET", data, params, headers, contentType }) => {
    try {
      const requestConfig: AxiosRequestConfig = {
        url: baseUrl + url,
        method,
        data,
        params,
        headers: {
          ...(contentType && { "Content-Type": contentType }),
          ...(!contentType && !(data instanceof FormData) && { "Content-Type": "application/json" }),
          ...headers,
        },
      };

      console.log("🔍 Making API Request:", requestConfig);

      const response = await axiosInstance(requestConfig);

      // Return the data directly since your interceptor already handles it
      return { data: response.data };

    } catch (error) {
      const axiosError = error as AxiosError;
      
      console.log("❌ API Call Failed:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });

      // Handle different error formats from your backend
      const backendError = axiosError.response?.data as any;
      
      let errorMessage = "Something went wrong";
      
      if (backendError) {
        // Your backend format: {success: false, message: "phone already registered"}
        if (backendError.message) {
          errorMessage = backendError.message;
        } else if (backendError.error) {
          errorMessage = backendError.error;
        } else if (typeof backendError === 'string') {
          errorMessage = backendError;
        }
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      return {
        error: {
          status: axiosError.response?.status,
          data: {
            message: errorMessage,
            success: false,
            ...backendError
          },
        },
      };
    }
  };