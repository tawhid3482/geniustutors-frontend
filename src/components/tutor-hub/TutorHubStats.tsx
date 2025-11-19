"use client";

import { useGetAllTutorHubStatsQuery } from "@/redux/features/tutorHub/tutorHubApi";
import { Users, User, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

export const TutorHubStats = () => {
  const { data: stats, isLoading: loading } =
    useGetAllTutorHubStatsQuery(undefined);
  const statsData = stats?.data;

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full sm:w-48 lg:w-64 h-24 sm:h-28 lg:h-32 bg-gray-200 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full sm:w-48 lg:w-64 border border-gray-200">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
              {statsData?.totalTutors?.toLocaleString()}
            </div>
            <div className="text-gray-600 font-medium text-sm sm:text-base">
              Total Tutors
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full sm:w-48 lg:w-64 border border-gray-200">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
              {statsData?.maleTutors?.toLocaleString()}
            </div>
            <div className="text-gray-600 font-medium text-sm sm:text-base">
              Male Tutors
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full sm:w-48 lg:w-64 border border-gray-200">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
              {statsData?.femaleTutors?.toLocaleString()}
            </div>
            <div className="text-gray-600 font-medium text-sm sm:text-base">
              Female Tutors
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
