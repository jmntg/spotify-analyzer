import { StreamingHistoryEntry, ExtendedStreamingHistoryEntry, ArtistStats, TrackStats, GenreStats, DashboardData } from '@/types/spotify';

export class SpotifyDataProcessor {
  private yearData: StreamingHistoryEntry[] = [];
  private extendedData: ExtendedStreamingHistoryEntry[] = [];
  private genreCache: { [artist: string]: string } = {};

  constructor() {}

  loadData(yearData: StreamingHistoryEntry[], extendedData: ExtendedStreamingHistoryEntry[], genreCache: { [artist: string]: string }) {
    this.yearData = yearData;
    this.extendedData = extendedData;
    this.genreCache = genreCache;
  }

  getTotalListeningTime(): { year: number; extended: number } {
    const yearMs = this.yearData.reduce((sum, entry) => sum + entry.msPlayed, 0);
    const extendedMs = this.extendedData.reduce((sum, entry) => sum + entry.ms_played, 0);
    
    return {
      year: yearMs / (1000 * 60 * 60), // Convert to hours
      extended: extendedMs / (1000 * 60 * 60)
    };
  }

  getTopArtists(limit: number = 50): { year: ArtistStats[]; extended: ArtistStats[] } {
    // Year data
    const yearArtistStats: { [artist: string]: { playtime: number; playCount: number } } = {};
    this.yearData.forEach(entry => {
      if (!yearArtistStats[entry.artistName]) {
        yearArtistStats[entry.artistName] = { playtime: 0, playCount: 0 };
      }
      yearArtistStats[entry.artistName].playtime += entry.msPlayed;
      yearArtistStats[entry.artistName].playCount += 1;
    });

    // Extended data
    const extendedArtistStats: { [artist: string]: { playtime: number; playCount: number } } = {};
    this.extendedData.forEach(entry => {
      const artist = entry.master_metadata_album_artist_name;
      if (!artist) return;
      
      if (!extendedArtistStats[artist]) {
        extendedArtistStats[artist] = { playtime: 0, playCount: 0 };
      }
      extendedArtistStats[artist].playtime += entry.ms_played;
      extendedArtistStats[artist].playCount += 1;
    });

    const formatArtistStats = (stats: { [artist: string]: { playtime: number; playCount: number } }): ArtistStats[] => {
      return Object.entries(stats)
        .map(([name, data]) => ({
          name,
          playtime: data.playtime / (1000 * 60), // Convert to minutes
          playCount: data.playCount
        }))
        .sort((a, b) => b.playtime - a.playtime)
        .slice(0, limit);
    };

    return {
      year: formatArtistStats(yearArtistStats),
      extended: formatArtistStats(extendedArtistStats)
    };
  }

  getTopTracks(limit: number = 50): { year: TrackStats[]; extended: TrackStats[] } {
    // Year data
    const yearTrackStats: { [key: string]: { artist: string; track: string; playtime: number; playCount: number } } = {};
    this.yearData.forEach(entry => {
      const key = `${entry.artistName}|||${entry.trackName}`;
      if (!yearTrackStats[key]) {
        yearTrackStats[key] = {
          artist: entry.artistName,
          track: entry.trackName,
          playtime: 0,
          playCount: 0
        };
      }
      yearTrackStats[key].playtime += entry.msPlayed;
      yearTrackStats[key].playCount += 1;
    });

    // Extended data
    const extendedTrackStats: { [key: string]: { artist: string; track: string; playtime: number; playCount: number } } = {};
    this.extendedData.forEach(entry => {
      const artist = entry.master_metadata_album_artist_name;
      const track = entry.master_metadata_track_name;
      if (!artist || !track) return;
      
      const key = `${artist}|||${track}`;
      if (!extendedTrackStats[key]) {
        extendedTrackStats[key] = {
          artist,
          track,
          playtime: 0,
          playCount: 0
        };
      }
      extendedTrackStats[key].playtime += entry.ms_played;
      extendedTrackStats[key].playCount += 1;
    });

    const formatTrackStats = (stats: { [key: string]: { artist: string; track: string; playtime: number; playCount: number } }): TrackStats[] => {
      return Object.values(stats)
        .map(data => ({
          artist: data.artist,
          track: data.track,
          playtime: data.playtime / (1000 * 60), // Convert to minutes
          playCount: data.playCount
        }))
        .sort((a, b) => b.playtime - a.playtime)
        .slice(0, limit);
    };

    return {
      year: formatTrackStats(yearTrackStats),
      extended: formatTrackStats(extendedTrackStats)
    };
  }

  getGenreStats(): { year: GenreStats; extended: GenreStats } {
    const getGenreStatsFromData = (data: StreamingHistoryEntry[] | ExtendedStreamingHistoryEntry[], isExtended: boolean): GenreStats => {
      const genreStats: GenreStats = {};
      
      data.forEach(entry => {
        const artist = isExtended 
          ? (entry as ExtendedStreamingHistoryEntry).master_metadata_album_artist_name 
          : (entry as StreamingHistoryEntry).artistName;
        
        if (!artist) return;
        
        const genre = this.genreCache[artist] || 'Unknown';
        const playtime = isExtended 
          ? (entry as ExtendedStreamingHistoryEntry).ms_played 
          : (entry as StreamingHistoryEntry).msPlayed;
        
        genreStats[genre] = (genreStats[genre] || 0) + playtime / (1000 * 60); // Convert to minutes
      });

      return genreStats;
    };

    return {
      year: getGenreStatsFromData(this.yearData, false),
      extended: getGenreStatsFromData(this.extendedData, true)
    };
  }

  processAllData(): DashboardData {
    const listeningTime = this.getTotalListeningTime();
    const topArtists = this.getTopArtists();
    const topTracks = this.getTopTracks();
    const genreStats = this.getGenreStats();

    return {
      totalListeningTime: listeningTime.year,
      totalListeningTimeExtended: listeningTime.extended,
      topArtists: topArtists.year,
      topTracks: topTracks.year,
      genreStats: genreStats.year,
      genreStatsExtended: genreStats.extended
    };
  }
}