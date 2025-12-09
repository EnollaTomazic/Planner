import { NextResponse, type NextRequest } from 'next/server'

import {
  createRoadmap,
  deleteRoadmap,
  getRoadmaps,
  updateRoadmap,
  type CreateRoadmapInput,
  type UpdateRoadmapInput,
  RoadmapNotFoundError,
  RoadmapValidationError,
} from '@/services/roadmap'

export const runtime = 'nodejs'

type UpdateRoadmapRequest = UpdateRoadmapInput & { id?: string }

function methodNotAllowed() {
  return NextResponse.json(
    { error: 'method_not_allowed' },
    {
      status: 405,
      headers: {
        Allow: 'GET, POST, PATCH, DELETE',
        'Cache-Control': 'no-store',
      },
    },
  )
}

async function parseJson<T>(request: NextRequest): Promise<T | NextResponse> {
  try {
    return (await request.json()) as T
  } catch (error) {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }
}

function handleError(error: unknown): NextResponse {
  if (error instanceof RoadmapValidationError) {
    return NextResponse.json(
      { error: 'invalid_payload', message: error.message },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (error instanceof RoadmapNotFoundError) {
    return NextResponse.json(
      { error: 'not_found', message: error.message },
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return NextResponse.json(
    { error: 'internal_error' },
    {
      status: 500,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}

export async function GET() {
  const response = NextResponse.json(
    { roadmaps: getRoadmaps() },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  )

  return response
}

export async function POST(request: NextRequest) {
  const parsed = await parseJson<CreateRoadmapInput>(request)
  if (parsed instanceof NextResponse) {
    return parsed
  }

  try {
    const roadmap = createRoadmap(parsed)
    return NextResponse.json(roadmap, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(request: NextRequest) {
  const parsed = await parseJson<UpdateRoadmapRequest>(request)
  if (parsed instanceof NextResponse) {
    return parsed
  }

  const id = parsed.id?.trim()
  if (!id) {
    return NextResponse.json(
      { error: 'invalid_payload', message: 'Roadmap id is required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const roadmap = updateRoadmap(id, parsed)
    return NextResponse.json(roadmap, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(request: NextRequest) {
  const parsed = await parseJson<{ id?: string }>(request)
  if (parsed instanceof NextResponse) {
    return parsed
  }

  const id = parsed.id?.trim()
  if (!id) {
    return NextResponse.json(
      { error: 'invalid_payload', message: 'Roadmap id is required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const deleted = deleteRoadmap(id)
    return NextResponse.json(
      { deleted: deleted.id },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT() {
  return methodNotAllowed()
}

export async function HEAD() {
  return methodNotAllowed()
}

export async function OPTIONS() {
  return methodNotAllowed()
}
