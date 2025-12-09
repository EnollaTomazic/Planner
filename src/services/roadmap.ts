import { randomUUID } from 'node:crypto'

export type RoadmapStatus = 'draft' | 'active' | 'archived'

export interface Milestone {
  id: string
  title: string
  dueDate?: string
}

export interface Roadmap {
  id: string
  title: string
  description?: string
  status: RoadmapStatus
  milestones: Milestone[]
  createdAt: string
  updatedAt: string
}

export interface MilestoneInput {
  id?: string
  title: string
  dueDate?: string
}

export interface CreateRoadmapInput {
  title: string
  description?: string
  status?: RoadmapStatus
  milestones?: MilestoneInput[]
}

export interface UpdateRoadmapInput {
  title?: string
  description?: string
  status?: RoadmapStatus
  milestones?: MilestoneInput[]
}

class RoadmapError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export class RoadmapValidationError extends RoadmapError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class RoadmapNotFoundError extends RoadmapError {
  constructor(id: string) {
    super(`Roadmap ${id} not found`, 404)
  }
}

const roadmaps = new Map<string, Roadmap>()

function normalizeTitle(title: string | undefined, required: boolean): string {
  const normalized = title?.trim() ?? ''
  if (normalized.length === 0 && required) {
    throw new RoadmapValidationError('Title is required')
  }

  if (normalized.length > 200) {
    throw new RoadmapValidationError('Title must be 200 characters or fewer')
  }

  return normalized
}

function normalizeStatus(status: RoadmapStatus | undefined, fallback: RoadmapStatus): RoadmapStatus {
  const normalized = status ?? fallback
  if (normalized !== 'draft' && normalized !== 'active' && normalized !== 'archived') {
    throw new RoadmapValidationError('Invalid status value')
  }

  return normalized
}

function normalizeDescription(description?: string): string | undefined {
  const normalized = description?.trim()
  return normalized && normalized.length > 0 ? normalized : undefined
}

function normalizeMilestones(inputs: MilestoneInput[] | undefined, existing: Milestone[]): Milestone[] {
  if (!inputs) {
    return existing
  }

  return inputs.map((input) => {
    const title = normalizeTitle(input.title, true)
    const dueDate = input.dueDate?.trim()

    if (dueDate && Number.isNaN(Date.parse(dueDate))) {
      throw new RoadmapValidationError('Milestone dueDate must be a valid date string')
    }

    return {
      id: input.id?.trim() && input.id.trim().length > 0 ? input.id.trim() : randomUUID(),
      title,
      dueDate,
    }
  })
}

export function getRoadmaps(): Roadmap[] {
  return Array.from(roadmaps.values())
}

export function getRoadmap(id: string): Roadmap {
  const normalizedId = id.trim()
  if (!normalizedId) {
    throw new RoadmapValidationError('Roadmap id is required')
  }

  const roadmap = roadmaps.get(normalizedId)
  if (!roadmap) {
    throw new RoadmapNotFoundError(normalizedId)
  }

  return roadmap
}

export function createRoadmap(input: CreateRoadmapInput): Roadmap {
  const title = normalizeTitle(input.title, true)
  const status = normalizeStatus(input.status, 'draft')
  const description = normalizeDescription(input.description)
  const milestones = normalizeMilestones(input.milestones, [])
  const now = new Date().toISOString()

  const roadmap: Roadmap = {
    id: randomUUID(),
    title,
    description,
    status,
    milestones,
    createdAt: now,
    updatedAt: now,
  }

  roadmaps.set(roadmap.id, roadmap)
  return roadmap
}

export function updateRoadmap(id: string, input: UpdateRoadmapInput): Roadmap {
  const existing = getRoadmap(id)
  const title = input.title !== undefined ? normalizeTitle(input.title, true) : existing.title
  const status = normalizeStatus(input.status, existing.status)
  const description =
    input.description !== undefined ? normalizeDescription(input.description) : existing.description
  const milestones = normalizeMilestones(input.milestones, existing.milestones)

  const updated: Roadmap = {
    ...existing,
    title,
    description,
    status,
    milestones,
    updatedAt: new Date().toISOString(),
  }

  roadmaps.set(updated.id, updated)
  return updated
}

export function deleteRoadmap(id: string): Roadmap {
  const roadmap = getRoadmap(id)
  roadmaps.delete(roadmap.id)
  return roadmap
}
