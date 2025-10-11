#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pnpm run prebuild
pnpm exec storybook build --config-dir storybook --output-dir storybook-static --quiet
