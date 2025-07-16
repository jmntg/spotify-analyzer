import os
import json
import time
import requests
from collections import defaultdict
from datetime import datetime


LASTFM_API_KEY = 'b4630668c93ce86b9d4e437221fa4a1b'  # Your API key here
GENRE_CACHE_FILE = 'genre_cache.json'

# ----- STEP 1: Load all song data from your JSON files -----
DATA_FILES = [
    'StreamingHistory_music_0.json',
    'StreamingHistory_music_1.json'
    # Add more filenames as needed
]

all_data = []
for filename in DATA_FILES:
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
        all_data.extend(data)
print(f"Total entries loaded: {len(all_data)}")

# ----- STEP 2: Extract unique artist names dynamically -----
artist_set = set()
for item in all_data:
    artist = item.get("artistName")  # Usually "artistName" in Spotify JSON
    if not artist:
        # Try alternative common keys if needed:
        artist = item.get("artist") or item.get("Artist")
    if artist:
        artist_set.add(artist.strip())

distinct_artists = sorted(artist_set)
print(f"Unique artists found: {len(distinct_artists)}")

# ----- STEP 3: Function to get artist genre from Last.fm API -----
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
        time.sleep(0.25)  # Rate limit
        resp.raise_for_status()
        data = resp.json()
        tags = data.get('toptags', {}).get('tag', [])
        filtered_tags = [tag for tag in tags if tag['name'].lower() not in ['seen live', 'favorites', 'favorite']]
        if filtered_tags:
            return filtered_tags[0]['name']
        return 'Unknown'
    except Exception as e:
        print(f"Error getting genre for {artist_name}: {e}")
        return 'Unknown'

# ----- STEP 4: Load or initialize the genre cache -----
if os.path.exists(GENRE_CACHE_FILE) and os.path.getsize(GENRE_CACHE_FILE) > 0:
    try:
        with open(GENRE_CACHE_FILE, 'r', encoding='utf-8') as f:
            artist_to_genre = json.load(f)
    except json.JSONDecodeError:
        print(f"Warning: {GENRE_CACHE_FILE} is not valid JSON. Rebuilding.")
        artist_to_genre = {}
else:
    artist_to_genre = {}

# ----- STEP 5: Look up genres, saving progress every 20 lookups -----
save_interval = 20
count_since_last_save = 0

for idx, artist in enumerate(distinct_artists, 1):
    if artist not in artist_to_genre:
        genre = get_artist_genre(artist)
        artist_to_genre[artist] = genre
        print(f"Looked up genre for {artist}: {genre}")
        count_since_last_save += 1

        if count_since_last_save >= save_interval:
            try:
                with open(GENRE_CACHE_FILE, 'w', encoding='utf-8') as f:
                    json.dump(artist_to_genre, f, indent=2, ensure_ascii=False)
                print(f"--- Progress saved after {idx} lookups ---")
            except Exception as e:
                print(f"Error writing to {GENRE_CACHE_FILE}: {e}")
            count_since_last_save = 0
        time.sleep(1)  # Be nice to the API

# ----- STEP 6: Final save to catch any remaining data -----
if count_since_last_save > 0:
    try:
        with open(GENRE_CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(artist_to_genre, f, indent=2, ensure_ascii=False)
        print("--- Final save completed ---")
    except Exception as e:
        print(f"Error writing final save to {GENRE_CACHE_FILE}: {e}")

# -------- STEP 5: SUMMARY BY GENRE --------
genre_playtime = defaultdict(int)
for entry in all_data:
    artist = entry['artistName']
    genre = artist_to_genre.get(artist, 'Unknown')
    genre_playtime[genre] += entry['msPlayed']

top_genres = sorted(genre_playtime.items(), key=lambda x: x[1], reverse=True)
print('\nTop genres by playtime:')
for genre, ms in top_genres[:10]:
    print(f"{genre}: {ms // (1000*60)} min")

print("\nDone! Go Blue! 🟡🔵")