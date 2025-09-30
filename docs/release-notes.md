# Release Notes

## Unreleased

- Added the `NEXT_PUBLIC_FEATURE_SVG_NUMERIC_FILTERS` environment flag to control numeric SVG filter parameters. The flag defaults to off so deployments continue using the CSS variable slope until the numeric path is validated.
- Added the `NEXT_PUBLIC_ORGANIC_DEPTH` flag to gate the organic depth utilities. The flag defaults to `false`, keeping the legacy control radii active; set it to `true` to roll out the new organic surfaces without shipping a code change.
