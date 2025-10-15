import usage from '@/components/gallery/usage.json'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

const UsageStateSchema = z.object({
  routes: z.array(z.string()),
})

const UsageEntrySchema = z.object({
  routes: z.array(z.string()),
  states: z.record(z.string(), UsageStateSchema),
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
          states: Object.keys(entry.states).sort(),
        },
      ]),
    )

    expect(summary).toMatchSnapshot()
  })

  it('ensures all usage entries are objects with state maps', () => {
    const normalized = JSON.parse(JSON.stringify(usage)) as unknown
    const parsed = UsageSchema.parse(normalized)

    for (const [id, entry] of Object.entries(parsed)) {
      expect(entry.routes, `entry ${id} routes should be an array`).toBeInstanceOf(
        Array,
      )
      expect(Object.getPrototypeOf(entry)).toBe(Object.prototype)
      expect(Object.getPrototypeOf(entry.states)).toBe(Object.prototype)
    }
  })
})
