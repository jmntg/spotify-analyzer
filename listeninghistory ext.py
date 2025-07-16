import json
from collections import defaultdict
from collections import Counter
from datetime import datetime

# Step 1: Load data from both files
files = [
    'StreamingHistory_music_0.json',
    'StreamingHistory_music_1.json'
]

files_extended = [
   'Streaming_History_Audio_20152020_0.json',
   'Streaming_History_Audio_20202022_1.json',
   'Streaming_History_Audio_20222024_2.json',
   'Streaming_History_Audio_20242025_3.json',
   'Streaming_History_Audio_2025_4.json'
]

all_data = []
for filename in files:
    with open(filename, 'r') as f:
        data = json.load(f)
        all_data.extend(data)

all_data_extended = []
for filename in files_extended:
    with open(filename, 'r') as f:
        data = json.load(f)
        all_data_extended.extend(data)


print(f"Total entries loaded: {len(all_data)}")
print(f"Total entries loaded (extended): {len(all_data_extended)}")

# Step 2: Summarize listening habits

# Total listening time in hours
total_ms = sum(entry['msPlayed'] for entry in all_data)
total_hours = total_ms / (1000 * 60 * 60)
print(f"\nTotal listening time over the last year: {total_hours:.2f} hours")

total_ms_ex = sum(entry['ms_played'] for entry in all_data_extended)
total_hours_ex = total_ms_ex / (1000 * 60 * 60)
print(f"\nTotal listening time since 2015: {total_hours_ex:.2f} hours")

# Top 50 artists by listening time
artist_playtime = defaultdict(int)
for entry in all_data:
    artist_playtime[entry['artistName']] += entry['msPlayed']
top_artists = sorted(artist_playtime.items(), key=lambda x: x[1], reverse=True)[:50]
print("\nTop 50 artists by playtime over the last year:")
for rank, (artist, ms) in enumerate(top_artists, start=1):
    print(f"{rank:2d}. {artist}: {ms // (1000*60)} min")

artist_playtime_ex = defaultdict(int)
for entry in all_data_extended:
    artist_playtime_ex[entry['master_metadata_album_artist_name']] += entry['ms_played']
top_artists_ex = sorted(artist_playtime_ex.items(), key=lambda x: x[1], reverse=True)[:50]
print("\nTop 50 artists by playtime since 2015:")
for rank, (artist, ms) in enumerate(top_artists_ex, start=1):
    print(f"{rank:2d}. {artist}: {ms // (1000*60)} min")

# Top 50 tracks by count
track_plays = Counter()
for entry in all_data:
    key = (entry['artistName'], entry['trackName'])
    track_plays[key] += 1

top_50_tracks = track_plays.most_common(50)
print("\nTop 50 tracks by number of plays over the last year:")
for rank, ((artist, track), play_count) in enumerate(top_50_tracks, start=1):
    print(f"{rank:2d}. {artist} - {track}: {play_count} plays")

track_plays_ex = Counter()
for entry in all_data_extended:
    key = (entry['master_metadata_album_artist_name'], entry['master_metadata_track_name'])
    track_plays_ex[key] += 1

top_50_tracks_ex = track_plays_ex.most_common(50)
print("\nTop 50 tracks by number of plays since 2015:")
for rank, ((artist, track), play_count) in enumerate(top_50_tracks_ex, start=1):
    print(f"{rank:2d}. {artist} - {track}: {play_count} plays")





# Top 50 tracks by listening time
track_playtime = defaultdict(int)
for entry in all_data:
    key = (entry['artistName'], entry['trackName'])
    track_playtime[key] += entry['msPlayed']
top_tracks = sorted(track_playtime.items(), key=lambda x: x[1], reverse=True)[:50]
print("\nTop 50 tracks by playtime over the last year:")
for rank, ((artist, track), ms) in enumerate(top_tracks, start=1):
    print(f"{rank:2d}. {artist} - {track}: {ms // (1000*60)} min")


track_playtime_ex = defaultdict(int)
for entry in all_data_extended:
    key = (entry['master_metadata_album_artist_name'], entry['master_metadata_track_name'])
    track_playtime_ex[key] += entry['ms_played']
top_tracks_ex = sorted(track_playtime_ex.items(), key=lambda x: x[1], reverse=True)[:50]
print("\nTop 50 tracks by playtime since 2015:")
for rank, ((artist, track), ms) in enumerate(top_tracks_ex, start=1):
    print(f"{rank:2d}. {artist} - {track}: {ms // (1000*60)} min")


