import type { Metadata } from 'next'
import Link from 'next/link'

import { PageShell } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/primitives/Card'

const galleryHref = '/components'

type DocSection = {
  id: string
  title: string
  summary: string
  bullets: readonly string[]
  code?: string
}

const DOC_SECTIONS: readonly DocSection[] = [
  {
    id: 'buttons',
    title: 'Buttons',
    summary:
      'Use Button for primary calls-to-action and IconButton for compact affordances. Variants map to semantic intent; prefer "default" for confirmation, "neo" on raised panels, and "quiet" for low-emphasis utility controls.',
    bullets: [
      'Use the size tokens (sm, md, lg) instead of custom padding to maintain vertical rhythm.',
      'Set `loading` on Button to show the spinner overlay without reflowing the label.',
      'SegmentedButton has replaced the deprecated `isActive` prop with `selected`; update any lingering uses to avoid stale visual states.',
    ],
    code: `// Accent button with loading state\n<Button variant="default" loading>Saving...</Button>\n\n// Segmented buttons use \'selected\' instead of the old \"isActive\"\n<SegmentedButton selected>Day</SegmentedButton>\n<SegmentedButton>Week</SegmentedButton>`,
  },
  {
    id: 'inputs',
    title: 'Inputs',
    summary:
      'Field primitives handle labels, helper text, and validation messaging; Input is a lightweight text control that pairs with FieldRoot when you need structure.',
    bullets: [
      'FieldRoot supports `surface` and `sunken` variants; mirror the surrounding panel depth instead of custom utility stacks.',
      'Use Input sizes (`sm`, `md`, `lg`) instead of custom heights to stay consistent with button sizing.',
      'For searchable chips, TagInput handles tokenization and keyboard interactions out of the box.',
    ],
    code: `// Labeled input with helper text\n<FieldRoot label="Project" helper="Visible to your squad">\n  <Input name="project" placeholder="Name your update" />\n</FieldRoot>`,
  },
  {
    id: 'toggles',
    title: 'Toggles & segmented controls',
    summary:
      'Use SegmentedControl for mutually exclusive options and Toggle for binary preferences. Keep labels concise; long strings should move to helper text.',
    bullets: [
      'Provide a stable key for each SegmentedControl option so keyboard roving order is predictable.',
      'Prefer `checked` on Toggle for controlled state; avoid mixing `defaultChecked` with external stores.',
      'SegmentedButton accepts `depth` (flat | raised | sunken) to align with the active surface.',
    ],
    code: `const viewOptions = [\n  { value: 'day', label: 'Day' },\n  { value: 'week', label: 'Week' },\n]\n\n<SegmentedControl\n  options={viewOptions}\n  value={view}\n  onValueChange={setView}\n/>`,
  },
  {
    id: 'feedback',
    title: 'Feedback & status',
    summary:
      'Use Spinner and Skeleton for loading states and Alert/Snackbar for actionable messaging. Keep status tones consistent with semantic meaning (success, caution, danger, info).',
    bullets: [
      'Wrap long-running async regions in <Spinner aria-live="polite"> to preserve accessibility cues.',
      'Skeletons should match the final layout dimensions to avoid layout shift.',
      'Use Snackbar for transient confirmations; prefer Alert when the user must acknowledge the message.',
    ],
    code: `<Skeleton className="h-10 w-full" />\n<Alert tone="info" title="Heads up">This change applies to all teammates.</Alert>`,
  },
  {
    id: 'forms',
    title: 'Forms, lists, and accordions',
    summary:
      'Reusable scaffolds keep planner flows consistent when capturing or summarizing data. EntityForm standardizes labeled fields, GenericList renders tokenized collections, and DayAccordion groups day-level summaries.',
    bullets: [
      'EntityForm accepts a field config array; use `initialValues` for edits and `onValuesChange` to sync draft state.',
      'GenericList expects stable `id` keys for each item and renders badges automatically when provided.',
      'DayAccordion defaults the first panel to open; pass `defaultOpen` per item for curated emphasis and use `onToggle` to log analytics.',
    ],
    code: `const fields = [\n  { id: 'name', label: 'Name', placeholder: 'Entity name' },\n  { id: 'notes', label: 'Notes', type: 'textarea' },\n]\n\n<EntityForm\n  title="Create entity"\n  fields={fields}\n  onSubmit={(values) => save(values)}\n/>\n\n<GenericList items={[{ id: '1', title: 'Item', badge: 'New' }]} />\n\n<DayAccordion\n  items={[{\n    id: 'mon',\n    title: 'Monday',\n    summary: '6 tasks completed',\n    children: <p>Progress recap goes here.</p>,\n  }]}\n/>`,
  },
]

export const metadata: Metadata = {
  title: 'Components documentation',
  description:
    'Usage guidelines, examples, and deprecations for Planner design-system components.',
}

export default function ComponentsDocsPage() {
  return (
    <PageShell
      as="main"
      id="docs-components"
      className="bg-surface-1/70"
      grid
      tabIndex={-1}
    >
      <Card className="col-span-full md:col-span-10 lg:col-span-8 xl:col-span-7">
        <CardContent className="space-y-[var(--space-5)] p-[var(--space-5)] sm:p-[var(--space-6)]">
          <header className="space-y-[var(--space-2)]">
            <p className="text-label text-muted-foreground">Design system</p>
            <div className="flex flex-wrap items-center gap-[var(--space-3)]">
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
                Component usage
              </h1>
              <Link className="text-link" href={galleryHref}>
                View the interactive gallery
              </Link>
            </div>
            <p className="text-base text-muted-foreground">
              Practical guidance for Planner primitives, with callouts for deprecated props and
              shortcuts that keep new screens consistent.
            </p>
          </header>

          <nav aria-label="Section shortcuts" className="flex flex-wrap gap-[var(--space-2)]">
            {DOC_SECTIONS.map((section) => (
              <Link
                key={section.id}
                className="rounded-full border border-card-hairline-60 px-[var(--space-3)] py-[var(--space-1)] text-label text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                href={`#${section.id}`}
              >
                {section.title}
              </Link>
            ))}
          </nav>

          <div className="space-y-[var(--space-6)]">
            {DOC_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="space-y-[var(--space-3)]">
                <header className="space-y-[var(--space-1)]">
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                    {section.title}
                  </h2>
                  <p className="text-base text-muted-foreground">{section.summary}</p>
                </header>
                <ul className="space-y-[var(--space-2)] text-base text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-[var(--space-2)]">
                      <span
                        aria-hidden
                        className="mt-[0.35em] size-[var(--space-1)] rounded-full bg-muted-foreground"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                {section.code ? (
                  <pre className="overflow-x-auto rounded-card border border-card-hairline-60 bg-[hsl(var(--surface-2)/0.7)] p-[var(--space-3)] text-sm text-muted-foreground">
                    <code className="whitespace-pre-wrap">{section.code}</code>
                  </pre>
                ) : null}
              </section>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
