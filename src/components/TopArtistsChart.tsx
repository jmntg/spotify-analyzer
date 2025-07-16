import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArtistStats } from '@/types/spotify';

interface TopArtistsChartProps {
  data: ArtistStats[];
  title: string;
  limit?: number;
}

export const TopArtistsChart: React.FC<TopArtistsChartProps> = ({ 
  data, 
  title, 
  limit = 10 
}) => {
  const chartData = data.slice(0, limit).map(artist => ({
    name: artist.name.length > 20 ? `${artist.name.substring(0, 20)}...` : artist.name,
    fullName: artist.name,
    playtime: Math.round(artist.playtime),
    playCount: artist.playCount
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{data.fullName}</p>
          <p className="text-spotify-green">{`${data.playtime} minutes`}</p>
          <p className="text-gray-500">{`${data.playCount} plays`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="playtime" fill="#1DB954" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};