/* eslint-disable @typescript-eslint/no-unused-vars */
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig, AxiosError } from "axios";
import { instance as axiosInstance } from "./axiosInstance";
import { IMeta } from "@/types/common";

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: "" }
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
      meta?: IMeta;
      contentType?: string;
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers, contentType }) => {
    try {
      // ✅ FormData হলে Content-Type set করবেন না
      const requestHeaders: AxiosRequestConfig["headers"] = {};
      
      // Only set Content-Type if it's NOT FormData
      if (contentType) {
        requestHeaders["Content-Type"] = contentType;
      } else if (!(data instanceof FormData)) {
        // Default to JSON only if not FormData
        requestHeaders["Content-Type"] = "application/json";
      }

      // ✅ Token থাকলে set করুন
      const token = localStorage.getItem("token");
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }

      // ✅ Custom headers যোগ করুন
      if (headers) {
        Object.assign(requestHeaders, headers);
      }

      console.log("🔍 Axios Request:", {
        url: baseUrl + url,
        method,
        dataType: data instanceof FormData ? "FormData" : typeof data,
        headers: requestHeaders,
      });

      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: requestHeaders,
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };