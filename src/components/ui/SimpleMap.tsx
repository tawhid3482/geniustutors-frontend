'use client';

import React from 'react';
import { MapPin, Navigation, Building, Home } from 'lucide-react';

interface SimpleMapProps {
  location: string;
  district: string;
  area: string;
  postOffice?: string;
  className?: string;
}

export default function SimpleMap({ 
  location, 
  district, 
  area, 
  postOffice, 
  className = '' 
}: SimpleMapProps) {
  return (
    <div className={`relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden border-2 border-gray-200 ${className}`}>
      {/* Map Header */}
      <div className="bg-white/80 backdrop-blur-sm p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-red-500" />
            <span className="font-semibold text-gray-800">Location Map</span>
          </div>
          <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
            Bangladesh
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="relative p-6 min-h-[300px]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Location Marker */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* Main Location Pin */}
          <div className="relative">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            {/* Ripple Effect */}
            <div className="absolute inset-0 w-16 h-16 bg-red-500 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-0 w-16 h-16 bg-red-500 rounded-full animate-ping opacity-10 animation-delay-1000"></div>
          </div>

          {/* Location Text */}
          <div className="mt-4 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{district}</h3>
            <p className="text-sm text-gray-600 mb-1">{area}</p>
            {postOffice && (
              <p className="text-xs text-gray-500">{postOffice}</p>
            )}
          </div>

          {/* Surrounding Landmarks */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
              <Building className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-gray-700">Area</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
              <Home className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-700">Residential</span>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
              <Navigation className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-gray-700 font-medium">Tutoring Location</span>
            </div>
          </div>

          {/* Compass */}
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
            <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-xs font-bold text-gray-800">N</div>
                <div className="text-xs text-gray-600">↑</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Scale */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
          Scale: 1:1000
        </div>
      </div>

      {/* Map Footer */}
      <div className="bg-gray-50 p-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>📍 {location}</span>
          <span>Interactive Map</span>
        </div>
      </div>
    </div>
  );
}
