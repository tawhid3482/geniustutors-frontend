import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const actionType = searchParams.get('action_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    const queryParams = new URLSearchParams();
    if (entityType) queryParams.append('entity_type', entityType);
    if (actionType) queryParams.append('action_type', actionType);
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    const response = await fetch(`${API_BASE_URL}/history?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history data' },
      { status: 500 }
    );
  }
}
