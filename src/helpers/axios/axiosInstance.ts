/* eslint-disable @typescript-eslint/ban-ts-comment */
import { authKey } from "@/contants/authKey";
import { IGenericErrorResponse, ResponseSuccessType } from "@/types/common";
import { getFromLocalStorage, setToLocalStorage } from "@/utils/local-storage";
import axios from "axios";
import toast from "react-hot-toast";

const instance = axios.create();
instance.defaults.headers.post["Content-Type"] = "application/json";
instance.defaults.headers["Accept"] = "application/json";
instance.defaults.timeout = 60000;

// Add base URL
instance.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

instance.interceptors.request.use(
  function (config) {
    const accessToken = getFromLocalStorage(authKey);
    console.log("🚀 API Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
    });

    if (accessToken) {
      config.headers.Authorization = accessToken;
    }
    return config;
  },
  function (error) {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    console.log("✅ API Response Success:", {
      status: response.status,
      data: response.data,
    });
    
    // Return the full response, not just data
    return response;
  },
  async function (error) {
    console.error("❌ API Response Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    const config = error.config;
    
    if (error?.response?.status === 401) {
      if (typeof window !== "undefined") {
        toast.error("Please login to continue");
        setTimeout(() => {
          window.location.href = "/signin";
        }, 1000);
      }
    }

    // Return the error properly for RTK Query to handle
    return Promise.reject(error);
  }
);

export { instance };