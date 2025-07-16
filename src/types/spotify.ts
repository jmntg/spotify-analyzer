export interface StreamingHistoryEntry {
  artistName: string;
  trackName: string;
  msPlayed: number;
  endTime: string;
}

export interface ExtendedStreamingHistoryEntry {
  master_metadata_album_artist_name: string;
  master_metadata_track_name: string;
  ms_played: number;
  ts: string;
}

export interface ArtistStats {
  name: string;
  playtime: number;
  playCount: number;
}

export interface TrackStats {
  artist: string;
  track: string;
  playtime: number;
  playCount: number;
}

export interface GenreStats {
  [genre: string]: number;
}

export interface DashboardData {
  totalListeningTime: number;
  totalListeningTimeExtended: number;
  topArtists: ArtistStats[];
  topTracks: TrackStats[];
  genreStats: GenreStats;
  genreStatsExtended: GenreStats;
}