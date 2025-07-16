import React from 'react';
import { TrackStats } from '@/types/spotify';

interface TopTracksTableProps {
  data: TrackStats[];
  title: string;
  limit?: number;
}

export const TopTracksTable: React.FC<TopTracksTableProps> = ({ 
  data, 
  title, 
  limit = 20 
}) => {
  const tableData = data.slice(0, limit);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">#</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Track</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Artist</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Time</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Plays</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((track, index) => (
              <tr 
                key={`${track.artist}-${track.track}`}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                  {index + 1}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  <div className="max-w-xs truncate" title={track.track}>
                    {track.track}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="max-w-xs truncate" title={track.artist}>
                    {track.artist}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                  {Math.round(track.playtime)} min
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                  {track.playCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};