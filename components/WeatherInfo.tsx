
import React from 'react';
import { WeatherData } from '../types';

interface WeatherInfoProps {
  data?: WeatherData;
}

const WeatherInfo: React.FC<WeatherInfoProps> = ({ data }) => {
  if (!data) return (
    <div className="text-[10px] text-gray-600 animate-pulse">
      FETCHING TELEMETRY & LOCAL WEATHER...
    </div>
  );

  return (
    <div className="flex items-center gap-4 bg-gray-900/40 border border-gray-800 px-3 py-1 rounded text-[10px] font-mono">
      <div className="flex flex-col">
        <span className="text-gray-500 uppercase">Location</span>
        <span className="text-blue-400">{data.location}</span>
      </div>
      <div className="w-px h-6 bg-gray-800" />
      <div className="flex flex-col">
        <span className="text-gray-500 uppercase">Temp</span>
        <span className="text-yellow-500">{data.temp}°C</span>
      </div>
      <div className="w-px h-6 bg-gray-800" />
      <div className="flex flex-col">
        <span className="text-gray-500 uppercase">Conditions</span>
        <span className="text-green-500">{data.condition.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default WeatherInfo;
