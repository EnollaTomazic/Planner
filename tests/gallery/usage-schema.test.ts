import usage from '@/components/gallery/usage.json'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

const UsageStateSchema = z.object({
  routes: z.array(z.string()),
})

const UsageEntrySchema = z.object({
  routes: z.array(z.string()),
  states: z.record(z.string(), UsageStateSchema).optional(),
})

const UsageSchema = z.record(z.string(), UsageEntrySchema)

describe('gallery usage schema', () => {
  it('matches expected snapshot', () => {
    const normalized = JSON.parse(JSON.stringify(usage)) as unknown
    const parsed = UsageSchema.parse(normalized)
    const summary = Object.fromEntries(
      Object.entries(parsed).map(([id, entry]) => [
        id,
        {
          routes: entry.routes.length,
          states: entry.states ? Object.keys(entry.states).sort() : [],
        },
      ]),
    )

    expect(summary).toMatchSnapshot()
  })
})
