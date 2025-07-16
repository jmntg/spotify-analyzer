import os
import json
import time
import requests
from collections import defaultdict
from datetime import datetime


LASTFM_API_KEY = 'b4630668c93ce86b9d4e437221fa4a1b'  # Your API key here
GENRE_CACHE_FILE = 'genre_cache.json'

#Load data from files
files = [
    'StreamingHistory_music_0.json',
    'StreamingHistory_music_1.json'
]

files_ex = [
   'Streaming_History_Audio_20152020_0.json',
   'Streaming_History_Audio_20202022_1.json',
   'Streaming_History_Audio_20222024_2.json',
   'Streaming_History_Audio_20242025_3.json',
   'Streaming_History_Audio_2025_4.json'
]

year_data = []
for filename in files:
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
        year_data.extend(data)
print(f"Total entries loaded, past year: {len(year_data)}")

all_data = []
for filename in files_ex:
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
        all_data.extend(data)
print(f"Total entries loaded, since 2015: {len(all_data)}")

# Extract unique artist names
artist_set = set()

def extract_artists(data):
    for item in data:
        artist = item.get("artistName")
        if not artist:
            artist = item.get("master_metadata_album_artist_name")
        if artist:
            artist_set.add(artist.strip())

extract_artists(year_data)
extract_artists(all_data)

distinct_artists = sorted(artist_set)
print(f"Unique artists found: {len(distinct_artists)}")

# Get artist genre from Last.fm API
def get_artist_genre(artist_name):
    url = 'http://ws.audioscrobbler.com/2.0/'
    params = {
        'method': 'artist.gettoptags',
        'artist': artist_name,
        'api_key': LASTFM_API_KEY,
        'format': 'json'
    }
    try:
        resp = requests.get(url, params=params, timeout=8)
        resp.raise_for_status()
        tags = resp.json().get('toptags', {}).get('tag', [])
        time.sleep(.25)  # Be nice to the API
        # Exclude unwanted tags
        for tag in tags:
            if tag['name'].lower() not in ['seen live', 'favorites', 'favorite']:
                return tag['name']
        return 'Unknown'
    except Exception as e:
        print(f"Error getting genre for {artist_name}: {e}")
        return 'Unknown'
    

# Load or initialize the genre cache
artist_to_genre = {}
if os.path.exists(GENRE_CACHE_FILE):
    try:
        with open(GENRE_CACHE_FILE, 'r', encoding='utf-8') as f:
            artist_to_genre = json.load(f)
    except Exception as e:
        print(f"Warning: Could not load or parse {GENRE_CACHE_FILE} ({e}). Rebuilding.")

# Look up genres, saving progress every 20 lookups
save_interval = 20
count_since_last_save = 0

for idx, artist in enumerate(distinct_artists, 1):
    if artist in artist_to_genre:
        continue
    genre = get_artist_genre(artist)
    artist_to_genre[artist] = genre
    print(f"Looked up genre for {artist}: {genre}")
    count_since_last_save += 1

    if count_since_last_save >= save_interval:
        try:
            with open(GENRE_CACHE_FILE, 'w', encoding='utf-8') as f:
                json.dump(artist_to_genre, f, indent=2, ensure_ascii=False)
            print(f"Progress saved")
        except Exception as e:
            print(f"Error writing to {GENRE_CACHE_FILE}: {e}")
        count_since_last_save = 0

# Final save after loop ends (in case total % save_interval != 0)
try:
    with open(GENRE_CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(artist_to_genre, f, indent=2, ensure_ascii=False)
    print(f"--- Final progress saved ---")
except Exception as e:
    print(f"Error writing to {GENRE_CACHE_FILE} (final save): {e}")

# == BEGIN: Playtime by genre ==

def accumulate_playtime(data, artist_to_genre):
    # Keeps track of total playtime per genre.
    # Assumes 'msPlayed' key in each record for milliseconds played.
    playtime_by_genre = defaultdict(int)
    for item in data:
        # Get artist
        artist = item.get("artistName")
        if not artist:
            artist = item.get("master_metadata_album_artist_name")
        if not artist:
            continue
        artist = artist.strip()
        # Look up genre, fallback to 'Unknown'
        genre = artist_to_genre.get(artist, 'Unknown')
        # Add playtime
        ms_played = item.get("msPlayed", item.get("ms_played", 0))
        playtime_by_genre[genre] += ms_played
    return playtime_by_genre

# Get playtime per genre for past year and for all years
playtime_by_genre_year = accumulate_playtime(year_data, artist_to_genre)
playtime_by_genre_all  = accumulate_playtime(all_data, artist_to_genre)

# Convert ms to hours for easier reading (optional, comment out if you want ms instead)
def playtime_to_mins(playtime_dict):
    return {genre: round(ms / 60_000, 2) for genre, ms in playtime_dict.items()}

playtime_by_genre_year_min = playtime_to_mins(playtime_by_genre_year)
playtime_by_genre_all_min  = playtime_to_mins(playtime_by_genre_all)

# Write out the files
with open("playtime_by_genre_year.json", "w", encoding="utf-8") as f:
    json.dump(playtime_by_genre_year_min, f, indent=2, ensure_ascii=False)

with open("playtime_by_genre_all.json", "w", encoding="utf-8") as f:
    json.dump(playtime_by_genre_all_min, f, indent=2, ensure_ascii=False)

print("Wrote playtime_by_genre_year.json and playtime_by_genre_all.json")
# == END: Playtime by genre ==

# Load genre_map from JSON file.
with open('genre_map.json', 'r', encoding='utf-8') as f:
    GENRE_MAP = json.load(f)
# Lower-case all raw genre groupings for lookup
GENRE_LOOKUP = {}
for umbrella, group in GENRE_MAP.items():
    for g in group:
        GENRE_LOOKUP[g.lower()] = umbrella

def combine_genres(playtime_by_genre):
    combined = defaultdict(float)
    for genre, minutes in playtime_by_genre.items():
        genre_key = genre.lower().strip()
        umbrella = GENRE_LOOKUP.get(genre_key)
        if umbrella:
            combined[umbrella] += minutes
        else:
            combined[genre] += minutes  # Keep unmatched as-is
    return combined

def print_top_genres(combined, label):
    print(f"\nTop combined genres for {label}:")
    for genre, minutes in sorted(combined.items(), key=lambda x: -x[1]):
        if minutes > 5:
            print(f"{genre:20s} {minutes:.2f} min")

combined_year = combine_genres(playtime_by_genre_year_min)
combined_all  = combine_genres(playtime_by_genre_all_min)

print_top_genres(combined_year, "last year")
print_top_genres(combined_all, "since 2015")



# SUMMARY BY GENRE

#genre_playtime_year = defaultdict(int)
#for entry in year_data:
#    artist = entry['artistName']
#    genre = artist_to_genre.get(artist, 'Unknown')
#    genre_playtime_year[genre] += entry['msPlayed']

#top_genres_year = sorted(genre_playtime_year.items(), key=lambda x: x[1], reverse=True)
#print('\nTop genres by playtime, past year:')
#for genre, ms in top_genres_year:
#    print(f"{genre}: {ms // (1000*60)} min")


#genre_playtime = defaultdict(int)
#for entry in all_data:
#    artist = entry['master_metadata_album_artist_name']
#    genre = artist_to_genre.get(artist, 'Unknown')
#    genre_playtime[genre] += entry['ms_played']

#top_genres = sorted(genre_playtime.items(), key=lambda x: x[1], reverse=True)
#print('\nTop genres by playtime, since 2015:')
#for genre, ms in top_genres:
#    print(f"{genre}: {ms // (1000*60)} min")

print("\nDone! Go Blue! 🟡🔵")