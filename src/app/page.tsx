'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Music, User, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { TopArtistsChart } from '@/components/TopArtistsChart';
import { TopTracksTable } from '@/components/TopTracksTable';
import { GenreChart } from '@/components/GenreChart';
import { SpotifyDataProcessor } from '@/lib/dataProcessor';
import { DashboardData } from '@/types/spotify';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExtended, setShowExtended] = useState(false);

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = async () => {
    try {
      // For now, we'll use sample data based on your existing analysis
      // In a real implementation, this would load from your JSON files
      const processor = new SpotifyDataProcessor();
      
      // Sample data structure - you'll replace this with actual JSON loading
      const sampleYearData = [
        { artistName: 'Taylor Swift', trackName: 'Anti-Hero', msPlayed: 180000, endTime: '2024-01-01' },
        { artistName: 'The Weeknd', trackName: 'Blinding Lights', msPlayed: 200000, endTime: '2024-01-02' },
        // Add more sample data here
      ];

      const sampleExtendedData = [
        { master_metadata_album_artist_name: 'Taylor Swift', master_metadata_track_name: 'Anti-Hero', ms_played: 180000, ts: '2024-01-01' },
        { master_metadata_album_artist_name: 'The Weeknd', master_metadata_track_name: 'Blinding Lights', ms_played: 200000, ts: '2024-01-02' },
        // Add more sample data here
      ];

      const sampleGenreCache = {
        'Taylor Swift': 'Pop',
        'The Weeknd': 'R&B',
        // Add more genre mappings
      };

      processor.loadData(sampleYearData, sampleExtendedData, sampleGenreCache);
      const processedData = processor.processAllData();
      
      setData(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const formatTime = (hours: number): string => {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return days > 0 ? `${days}d ${remainingHours}h` : `${remainingHours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your music data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-spotify-green mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Spotify Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowExtended(!showExtended)}
                className="bg-spotify-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                {showExtended ? 'Show Year View' : 'Show All Time'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Listening Time"
            value={formatTime(showExtended ? data.totalListeningTimeExtended : data.totalListeningTime)}
            subtitle={showExtended ? 'Since 2015' : 'Past Year'}
            icon={<Clock className="h-6 w-6" />}
            gradient={true}
          />
          <StatsCard
            title="Top Artists"
            value={data.topArtists.length.toString()}
            subtitle="Tracked"
            icon={<User className="h-6 w-6" />}
          />
          <StatsCard
            title="Top Tracks"
            value={data.topTracks.length.toString()}
            subtitle="Analyzed"
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <StatsCard
            title="Genres"
            value={Object.keys(showExtended ? data.genreStatsExtended : data.genreStats).length.toString()}
            subtitle="Discovered"
            icon={<Music className="h-6 w-6" />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TopArtistsChart 
            data={data.topArtists} 
            title={`Top Artists ${showExtended ? '(All Time)' : '(Past Year)'}`}
            limit={10}
          />
          <GenreChart 
            data={showExtended ? data.genreStatsExtended : data.genreStats}
            title={`Genre Distribution ${showExtended ? '(All Time)' : '(Past Year)'}`}
          />
        </div>

        {/* Tracks Table */}
        <div className="mb-8">
          <TopTracksTable 
            data={data.topTracks} 
            title={`Top Tracks ${showExtended ? '(All Time)' : '(Past Year)'}`}
            limit={25}
          />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>🎵 Spotify Analytics Dashboard - Built with love for music data</p>
        </footer>
      </main>
    </div>
  );
}