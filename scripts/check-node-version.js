import { readFileSync } from 'node:fs'

const rawCi = String(process.env.CI ?? '').trim().toLowerCase()
const ciValues = new Set(['1', 'true', 'yes'])

function parseSegments(value) {
  return value
    .split('.')
    .map((segment) => Number.parseInt(segment, 10))
    .filter((segment) => !Number.isNaN(segment))
}

function satisfiesMinimumVersion(actual, expected) {
  const length = Math.max(expected.length, 1)
  for (let index = 0; index < length; index += 1) {
    const actualSegment = actual[index] ?? 0
    const expectedSegment = expected[index] ?? 0

    if (actualSegment > expectedSegment) {
      return true
    }

    if (actualSegment < expectedSegment) {
      return false
    }
  }

  return true
}

function enforceNodeVersion() {
  let expectedRaw = ''
  try {
    expectedRaw = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8')
  } catch (error) {
    console.warn(
      'Unable to read .nvmrc when checking the active Node.js version. Ensure you\'re using the repository\'s required release.',
    )
    return
  }

  const expected = expectedRaw.trim().replace(/^v/i, '')

  if (!expected) {
    console.warn(
      '.nvmrc did not contain a Node.js version. Skipping local version enforcement.',
    )
    return
  }

  const expectedSegments = parseSegments(expected)
  const actualRaw = process.versions.node
  const actualSegments = parseSegments(actualRaw)

  if (actualSegments.length === 0) {
    console.warn(
      'Unable to detect the active Node.js version. Ensure it matches the .nvmrc requirement.',
    )
    return
  }

  if (satisfiesMinimumVersion(actualSegments, expectedSegments)) {
    return
  }

  const precision = expectedSegments.length
  let hint = expected
  if (precision === 1) {
    hint = `${expectedSegments[0]}.x`
  } else if (precision === 2) {
    hint = `${expectedSegments[0]}.${expectedSegments[1]}.x`
  }

  console.error(
    `[node-version] Detected Node.js ${actualRaw}. Update to ${hint} as specified in .nvmrc before continuing.`,
  )
  process.exit(1)
}

if (!ciValues.has(rawCi)) {
  enforceNodeVersion()
}
