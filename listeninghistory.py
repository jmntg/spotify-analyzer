import json
from collections import defaultdict
from datetime import datetime

# Step 1: Load data from both files
files = [
    'StreamingHistory_music_0.json',
    'StreamingHistory_music_1.json'
]

all_data = []
for filename in files:
    with open(filename, 'r') as f:
        data = json.load(f)
        all_data.extend(data)

print(f"Total entries loaded: {len(all_data)}")

# Step 2: Summarize listening habits

# Total listening time in hours
total_ms = sum(entry['msPlayed'] for entry in all_data)
total_hours = total_ms / (1000 * 60 * 60)
print(f"\nTotal listening time: {total_hours:.2f} hours")

# Top 50 artists by listening time
artist_playtime = defaultdict(int)
for entry in all_data:
    artist_playtime[entry['artistName']] += entry['msPlayed']
top_artists = sorted(artist_playtime.items(), key=lambda x: x[1], reverse=True)[:50]
print("\nTop 50 artists by playtime:")
for artist, ms in top_artists:
    print(f"{artist}: {ms // (1000*60)} min")

# Top 50 tracks by listening time
track_playtime = defaultdict(int)
for entry in all_data:
    key = (entry['artistName'], entry['trackName'])
    track_playtime[key] += entry['msPlayed']
top_tracks = sorted(track_playtime.items(), key=lambda x: x[1], reverse=True)[:50]
print("\nTop 50 tracks by playtime:")
for (artist, track), ms in top_tracks:
    print(f"{artist} - {track}: {ms // (1000*60)} min")

# Number of distinct artists and tracks
distinct_artists = set(entry['artistName'] for entry in all_data)
distinct_tracks = set((entry['artistName'], entry['trackName']) for entry in all_data)
print(f"\nNumber of distinct artists: {len(distinct_artists)}")
print(f"Number of distinct tracks: {len(distinct_tracks)}")

# Tracks played per month
monthly_counts = defaultdict(int)
for entry in all_data:
    dt = datetime.strptime(entry['endTime'], "%Y-%m-%d %H:%M")
    monthly_key = dt.strftime("%Y-%m")
    monthly_counts[monthly_key] += 1
print("\nTracks played per month:")
for month in sorted(monthly_counts):
    print(f"{month}: {monthly_counts[month]}")