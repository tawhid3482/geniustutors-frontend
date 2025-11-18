import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    const queryParams = new URLSearchParams({
      category,
      limit,
      offset,
    });

    const response = await fetch(`${API_BASE_URL}/tutor-hub?${queryParams}`, {
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
    console.error('Error fetching tutors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutors' },
      { status: 500 }
    );
  }
}
