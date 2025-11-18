import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    // Fetch main tutor payload
    const tutorRes = await fetch(`${API_BASE_URL}/tutors/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Ensure fresh fetch
      cache: 'no-store',
    })

    if (!tutorRes.ok) {
      const err = await tutorRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.error || `Failed to fetch tutor ${id}` },
        { status: tutorRes.status }
      )
    }

    const tutorPayload = await tutorRes.json()
    const tutorData = tutorPayload?.data || {}

    // Try to fetch tutor_details for blood group (best-effort)
    let blood_group: string | undefined
    try {
      // Attempt common patterns for a public details endpoint
      const detailCandidates = [
        `${API_BASE_URL}/tutor-details/by-user/${id}`,
        `${API_BASE_URL}/tutor-details/user/${id}`,
        `${API_BASE_URL}/tutor-details/${id}`,
      ]

      for (const url of detailCandidates) {
        const dRes = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' })
        if (dRes.ok) {
          const dJson = await dRes.json().catch(() => ({} as any))
          const dData = dJson?.data || dJson || {}
          blood_group = dData?.blood_group || dData?.bloodGroup
          if (blood_group) break
        }
      }
    } catch {
      // ignore, keep best-effort
    }

    const merged = {
      ...tutorData,
      ...(blood_group ? { blood_group } : {}),
    }

    return NextResponse.json({ success: true, data: merged })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to fetch tutor' },
      { status: 500 }
    )
  }
}


