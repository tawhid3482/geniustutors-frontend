import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/tutors/stats/districts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching district stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch district statistics' },
      { status: 500 }
    );
  }
}
