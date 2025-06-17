import { NextResponse } from 'next/server';

const BASE_URL = process.env.N2YO_BASE_URL;
const API_KEY = process.env.N2YO_API_KEY;

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 300000; // 5 minutes cache for TLE data (changes less frequently)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const satId = searchParams.get('satId');

    if (!satId) {
      return NextResponse.json(
        { error: 'Missing required parameter: satId' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `tle-${satId}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    const response = await fetch(
      `${BASE_URL}/tle/${satId}/${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch TLE data');
    }

    const data = await response.json();

    // Update cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching TLE data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TLE data' },
      { status: 500 }
    );
  }
}
