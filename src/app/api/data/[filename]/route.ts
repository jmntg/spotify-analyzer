import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Security check - only allow specific JSON files
    const allowedFiles = [
      'StreamingHistory_music_0.json',
      'StreamingHistory_music_1.json',
      'Streaming_History_Audio_20152020_0.json',
      'Streaming_History_Audio_20202022_1.json',
      'Streaming_History_Audio_20222024_2.json',
      'Streaming_History_Audio_20242025_3.json',
      'Streaming_History_Audio_2025_4.json',
      'genre_cache.json',
      'playtime_by_genre_year.json',
      'playtime_by_genre_all.json'
    ];

    if (!allowedFiles.includes(filename)) {
      return NextResponse.json({ error: 'File not allowed' }, { status: 403 });
    }

    const filePath = path.join(process.cwd(), filename);
    const fileContent = await readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}