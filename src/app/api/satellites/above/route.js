import { NextResponse } from 'next/server';

const BASE_URL = process.env.N2YO_BASE_URL;
const API_KEY = process.env.N2YO_API_KEY;

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5000; // 5 seconds cache

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const alt = searchParams.get('alt') || 0;
    const cat = searchParams.get('cat') || 0;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lng' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `above-${lat}-${lng}-${alt}-${cat}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    const response = await fetch(
      `${BASE_URL}/above/${lat}/${lng}/${alt}/${cat}/${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch satellites');
    }

    const data = await response.json();

    // Update cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching satellites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch satellites' },
      { status: 500 }
    );
  }
}
