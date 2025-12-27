import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/helpers/axios/axiosBaseQuery";
import { tagTypesList } from "../tag-types";

// Define a service using a base URL and expected endpoints
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    // baseUrl: "https://geniustutorss-backend.vercel.app/api",
    baseUrl: "http://localhost:5008/api",
    // baseUrl: "http://160.25.7.224:5000/api",
    // baseUrl: "https://www.geniustutorss.com/api/api",
  }),
  endpoints: () => ({}),
  tagTypes: tagTypesList,
});
