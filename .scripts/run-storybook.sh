#!/usr/bin/env bash
set -euo pipefail

# Ensure Storybook builds run consistently with pnpm
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@10.18.2 --activate

pnpm exec storybook build "$@"
