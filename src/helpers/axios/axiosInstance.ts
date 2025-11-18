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

instance.interceptors.request.use(
  function (config) {
    const accessToken = getFromLocalStorage(authKey);

    if (accessToken) {
      config.headers.Authorization = accessToken;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  //@ts-ignore
  function (response) {
    const responseObject: ResponseSuccessType = {
      data: response?.data?.data,
      meta: response?.data?.meta,
    };
    return responseObject;
  },
  async function (error) {
    const config = error.config;
    if (error?.response?.status === 401) {
      if (typeof window !== "undefined") {
        toast.error("Please login to continue");

        setTimeout(() => {
          window.location.href = "/signin";
        }, 1000);
      }
    }
   
  }
);

export { instance };