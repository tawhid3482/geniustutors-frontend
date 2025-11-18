import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const limit = searchParams.get('limit') || '10';

    if (!q) {
      return NextResponse.json({ tutors: [], total: 0 });
    }

    const queryParams = new URLSearchParams({
      q,
      limit,
    });

    const response = await fetch(`${API_BASE_URL}/tutor-hub/search?${queryParams}`, {
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
    console.error('Error searching tutors:', error);
    return NextResponse.json(
      { error: 'Failed to search tutors' },
      { status: 500 }
    );
  }
}
