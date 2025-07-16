import { StreamingHistoryEntry, ExtendedStreamingHistoryEntry, DashboardData } from '@/types/spotify';

export class DataLoader {
  static async loadJsonFile(filename: string): Promise<any> {
    try {
      const response = await fetch(`/api/data/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return null;
    }
  }

  static async loadSpotifyData(): Promise<DashboardData> {
    try {
      // Load streaming history files
      const yearFiles = [
        'StreamingHistory_music_0.json',
        'StreamingHistory_music_1.json'
      ];

      const extendedFiles = [
        'Streaming_History_Audio_20152020_0.json',
        'Streaming_History_Audio_20202022_1.json',
        'Streaming_History_Audio_20222024_2.json',
        'Streaming_History_Audio_20242025_3.json',
        'Streaming_History_Audio_2025_4.json'
      ];

      // Load year data
      const yearData: StreamingHistoryEntry[] = [];
      for (const filename of yearFiles) {
        const data = await this.loadJsonFile(filename);
        if (data) {
          yearData.push(...data);
        }
      }

      // Load extended data
      const extendedData: ExtendedStreamingHistoryEntry[] = [];
      for (const filename of extendedFiles) {
        const data = await this.loadJsonFile(filename);
        if (data) {
          extendedData.push(...data);
        }
      }

      // Load genre cache
      const genreCache = await this.loadJsonFile('genre_cache.json') || {};

      // Load processed genre data
      const genreStatsYear = await this.loadJsonFile('playtime_by_genre_year.json') || {};
      const genreStatsExtended = await this.loadJsonFile('playtime_by_genre_all.json') || {};

      // Process the data
      const processedData = this.processData(yearData, extendedData, genreCache, genreStatsYear, genreStatsExtended);
      
      return processedData;
    } catch (error) {
      console.error('Error loading Spotify data:', error);
      throw error;
    }
  }

  private static processData(
    yearData: StreamingHistoryEntry[],
    extendedData: ExtendedStreamingHistoryEntry[],
    genreCache: { [artist: string]: string },
    genreStatsYear: { [genre: string]: number },
    genreStatsExtended: { [genre: string]: number }
  ): DashboardData {
    
    // Calculate total listening time
    const totalListeningTime = yearData.reduce((sum, entry) => sum + entry.msPlayed, 0) / (1000 * 60 * 60);
    const totalListeningTimeExtended = extendedData.reduce((sum, entry) => sum + entry.ms_played, 0) / (1000 * 60 * 60);

    // Calculate top artists
    const artistPlaytime: { [artist: string]: { playtime: number; playCount: number } } = {};
    yearData.forEach(entry => {
      if (!artistPlaytime[entry.artistName]) {
        artistPlaytime[entry.artistName] = { playtime: 0, playCount: 0 };
      }
      artistPlaytime[entry.artistName].playtime += entry.msPlayed;
      artistPlaytime[entry.artistName].playCount += 1;
    });

    const topArtists = Object.entries(artistPlaytime)
      .map(([name, data]) => ({
        name,
        playtime: data.playtime / (1000 * 60), // Convert to minutes
        playCount: data.playCount
      }))
      .sort((a, b) => b.playtime - a.playtime)
      .slice(0, 50);

    // Calculate top tracks
    const trackPlaytime: { [key: string]: { artist: string; track: string; playtime: number; playCount: number } } = {};
    yearData.forEach(entry => {
      const key = `${entry.artistName}|||${entry.trackName}`;
      if (!trackPlaytime[key]) {
        trackPlaytime[key] = {
          artist: entry.artistName,
          track: entry.trackName,
          playtime: 0,
          playCount: 0
        };
      }
      trackPlaytime[key].playtime += entry.msPlayed;
      trackPlaytime[key].playCount += 1;
    });

    const topTracks = Object.values(trackPlaytime)
      .map(data => ({
        artist: data.artist,
        track: data.track,
        playtime: data.playtime / (1000 * 60), // Convert to minutes
        playCount: data.playCount
      }))
      .sort((a, b) => b.playtime - a.playtime)
      .slice(0, 50);

    return {
      totalListeningTime,
      totalListeningTimeExtended,
      topArtists,
      topTracks,
      genreStats: genreStatsYear,
      genreStatsExtended
    };
  }
}