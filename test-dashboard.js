// Simple test script to verify the dashboard components
const fs = require('fs');
const path = require('path');

// Test data loading
console.log('Testing data loading...');

try {
  // Check if files exist
  const files = [
    'StreamingHistory_music_0.json',
    'StreamingHistory_music_1.json',
    'genre_cache.json',
    'playtime_by_genre_year.json',
    'playtime_by_genre_all.json'
  ];

  console.log('Checking files:');
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(`✓ ${file} - ${Math.round(stats.size / 1024)} KB`);
    } else {
      console.log(`✗ ${file} - NOT FOUND`);
    }
  });

  // Test loading and processing year data
  if (fs.existsSync('StreamingHistory_music_0.json')) {
    const yearData = JSON.parse(fs.readFileSync('StreamingHistory_music_0.json', 'utf-8'));
    console.log(`\nYear data sample (first 3 entries):`);
    console.log(JSON.stringify(yearData.slice(0, 3), null, 2));
    
    // Calculate some basic stats
    const totalMs = yearData.reduce((sum, entry) => sum + entry.msPlayed, 0);
    const totalHours = totalMs / (1000 * 60 * 60);
    console.log(`\nTotal entries: ${yearData.length}`);
    console.log(`Total listening time: ${totalHours.toFixed(2)} hours`);

    // Top artists calculation
    const artistPlaytime = {};
    yearData.forEach(entry => {
      artistPlaytime[entry.artistName] = (artistPlaytime[entry.artistName] || 0) + entry.msPlayed;
    });
    
    const topArtists = Object.entries(artistPlaytime)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([artist, ms]) => ({ artist, minutes: Math.round(ms / (1000 * 60)) }));
    
    console.log('\nTop 5 artists:');
    topArtists.forEach((artist, index) => {
      console.log(`${index + 1}. ${artist.artist}: ${artist.minutes} minutes`);
    });
  }

  // Test genre data
  if (fs.existsSync('playtime_by_genre_year.json')) {
    const genreData = JSON.parse(fs.readFileSync('playtime_by_genre_year.json', 'utf-8'));
    console.log('\nGenre data sample:');
    const topGenres = Object.entries(genreData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    topGenres.forEach(([genre, minutes]) => {
      console.log(`${genre}: ${minutes} minutes`);
    });
  }

  console.log('\n✓ Dashboard data processing test completed successfully!');
  
} catch (error) {
  console.error('Error during testing:', error);
}

console.log('\n🎵 Ready to run the dashboard!');
console.log('To start the development server, run: npm run dev');
console.log('Then open http://localhost:3000 in your browser');