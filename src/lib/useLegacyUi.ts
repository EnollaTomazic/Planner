export function isLegacyUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_LEGACY_UI === 'true'
}

export function useLegacyUi(): boolean {
  return isLegacyUiEnabled()
}
