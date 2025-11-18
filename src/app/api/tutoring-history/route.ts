import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    let transformedData = [];

    try {
      // Try to use backend API first
      let endpoint = '';
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      switch (type) {
        case 'demo':
          endpoint = '/demo-classes';
          break;
        case 'assignment':
        case 'confirmed':
        case 'cancelled':
          endpoint = '/tutor-assignments';
          queryParams.append('status', type === 'assignment' ? 'pending' : type === 'confirmed' ? 'completed' : 'rejected');
          break;
        case 'pending':
          endpoint = '/tutor-requests';
          queryParams.append('status', 'active');
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid type parameter' },
            { status: 400 }
          );
      }

      // Make request to backend
      const response = await fetch(`${API_BASE_URL}${endpoint}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { 'Authorization': authHeader }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform data based on type
        if (data.success && data.data) {
          switch (type) {
            case 'demo':
              transformedData = data.data.map((item: any) => ({
                id: item.id,
                job_id: item.id,
                date: item.created_at,
                tutor_name: item.tutor_name || 'N/A',
                student_name: item.student_name || 'Anonymous Student',
                subject: item.subject,
                district: item.request_district || item.district,
                area: item.request_area || item.area,
                duration: item.duration,
                status: item.status
              }));
              break;
            case 'assignment':
            case 'confirmed':
            case 'cancelled':
              transformedData = data.data.map((item: any) => ({
                id: item.id,
                job_id: item.tutor_request_id,
                date: type === 'assignment' ? item.assigned_at : item.updated_at,
                tutor_name: item.tutor_name || 'N/A',
                student_name: item.student_name,
                subject: item.subject,
                district: item.district,
                area: item.area,
                status: item.status
              }));
              break;
            case 'pending':
              transformedData = data.data.map((item: any) => ({
                id: item.id,
                job_id: item.id,
                date: item.created_at,
                tutor_name: 'N/A',
                student_name: item.student_name,
                subject: item.subject,
                district: item.district,
                area: item.area,
                salary_range: `৳${item.salary_range_min} - ৳${item.salary_range_max}`,
                status: item.status
              }));
              break;
          }
        }
      } else {
        throw new Error(`Backend API failed with status: ${response.status}`);
      }
    } catch (backendError) {
      console.warn('Backend API failed, using fallback data:', backendError);
      
      // Fallback: Return mock data structure for now
      // In a real implementation, you could implement direct database queries here
      transformedData = [];
    }

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        current_page: parseInt(page),
        limit: parseInt(limit),
        total_records: transformedData.length
      }
    });

  } catch (error) {
    console.error('Error fetching tutoring history:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch tutoring history data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
