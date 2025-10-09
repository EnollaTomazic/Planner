import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { SanitizedInputOptions } from '../src/ai/safety'

type SampleCase = {
  readonly id: string
  readonly description: string
  readonly input: string
  readonly expected: string
  readonly options?: SanitizedInputOptions
}

async function loadSamples(): Promise<SampleCase[]> {
  const directory = path.dirname(fileURLToPath(import.meta.url))
  const samplesPath = path.join(directory, 'samples.json')
  const raw = await readFile(samplesPath, 'utf8')
  return JSON.parse(raw) as SampleCase[]
}

function printCase(sample: SampleCase, actual: string, matches: boolean): void {
  console.log(`• ${sample.id}: ${sample.description}`)
  console.log(`  input: ${JSON.stringify(sample.input)}`)
  console.log(`  expected: ${JSON.stringify(sample.expected)}`)
  console.log(`  actual: ${JSON.stringify(actual)}`)
  console.log(`  status: ${matches ? '✅ match' : '❌ mismatch'}`)
  console.log('')
}

async function loadSanitizer() {
  if (!process.env.NEXT_PUBLIC_SAFE_MODE) {
    process.env.NEXT_PUBLIC_SAFE_MODE = 'false'
  }

  const module = await import('../src/ai/safety')
  return module.sanitizePrompt
}

async function main(): Promise<void> {
  const samples = await loadSamples()
  const sanitizePrompt = await loadSanitizer()
  let hasMismatch = false
  const mismatches: SampleCase[] = []

  for (const sample of samples) {
    const actual = sanitizePrompt(sample.input, sample.options)
    const matches = actual === sample.expected

    if (!matches) {
      hasMismatch = true
      mismatches.push(sample)
    }

    printCase(sample, actual, matches)
  }

  console.log('Summary:')
  console.log(
    `  ${samples.length - mismatches.length} / ${samples.length} cases match expectations.`,
  )

  if (mismatches.length > 0) {
    console.log('  Failing cases:')
    for (const sample of mismatches) {
      console.log(`    • ${sample.id}`)
    }
  }

  if (hasMismatch) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
