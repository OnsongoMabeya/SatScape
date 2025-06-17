import { NextResponse } from 'next/server';

const BASE_URL = process.env.N2YO_BASE_URL;
const API_KEY = process.env.N2YO_API_KEY;

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5000; // 5 seconds cache

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const satId = searchParams.get('satId');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const alt = searchParams.get('alt') || 0;
    const seconds = searchParams.get('seconds') || 2;

    if (!satId || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters: satId, lat, lng' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `positions-${satId}-${lat}-${lng}-${alt}-${seconds}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    const response = await fetch(
      `${BASE_URL}/positions/${satId}/${lat}/${lng}/${alt}/${seconds}/${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch satellite positions');
    }

    const data = await response.json();

    // Update cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching satellite positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch satellite positions' },
      { status: 500 }
    );
  }
}
