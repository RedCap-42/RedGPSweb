import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server';

const LOCATION_KEY = 'latest_gps_location';

// Fallback for local testing without Vercel KV environment variables
let localLocationData: any = null;

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { lat, lng, timestamp, accuracy } = data;

        if (lat === undefined || lng === undefined) {
            return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
        }

        const locationData = { lat, lng, timestamp: timestamp || Date.now(), accuracy };

        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            // Store in KV
            const redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            })
            await redis.set(LOCATION_KEY, locationData);
        } else {
            // Local fallback
            localLocationData = locationData;
            console.log("[Local Memory] Saved location:", locationData);
        }

        return NextResponse.json({ success: true, data: locationData });
    } catch (error) {
        console.error('API POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        let locationData;

        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            const redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            })
            locationData = await redis.get(LOCATION_KEY);
        } else {
            locationData = localLocationData;
        }

        if (!locationData) {
            return NextResponse.json({ error: 'No location data found' }, { status: 404 });
        }

        return NextResponse.json(locationData);
    } catch (error) {
        console.error('API GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
