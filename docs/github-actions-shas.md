# GitHub Actions commit SHAs

The workflows in this repository pin third-party GitHub Actions to exact commit SHAs for supply-chain safety. Update the table below when bumping an action so that future reviews can quickly verify expected revisions.

| Action | Upstream tag | Commit SHA | Referenced in workflows |
| --- | --- | --- | --- |
| `actions/checkout` | `v5.0.0` | `08c6903cd8c0fde910a37f88322edcfb5dd907a8` | `ci.yml`, `codex-autofix.yml`, `deploy-pages.yml`, `nightly-regen.yml`, `regen-bot.yml`, `workflow-lint.yml`, `.github/actions/setup-node-project/action.yml` |
| `actions/setup-node` | `v4.4.0` | `49933ea5288caeca8642d1e84afbd3f7d6820020` | `.github/actions/setup-node-project/action.yml` |
| `.github/actions/setup-node-project` (composite) | `v4.4.0` | `49933ea5288caeca8642d1e84afbd3f7d6820020` | `ci.yml`, `codex-autofix.yml`, `deploy-pages.yml`, `nightly-regen.yml`, `regen-bot.yml`, `workflow-lint.yml` |
| `actions/configure-pages` | `v5` | `f65c7f0a20510b02fd348436de4b0bd711c4d7f9` | `deploy-pages.yml`, `deploy-preview.yml` |
| `actions/cache` | `v4` | `0400d5f644dc74513175e3cd8d07132dd4860809` | `ci.yml`, `visual-regression.yml` |
| `actions/upload-pages-artifact` | `v4` | `7b1f4a764d45c48632c6b24a0339c27f5614fb0b` | `deploy-pages.yml`, `deploy-preview.yml` |
| `actions/deploy-pages` | `v4` | `af48c8d784fbb3eccd0f19f41da3b3c25c2ba234` | `deploy-pages.yml`, `deploy-preview.yml` |

## Updating the pins

Use `git ls-remote` to resolve a new tag to its commit when updating, for example:

```bash
git ls-remote https://github.com/actions/checkout refs/tags/v5
```

Replace the SHA in the workflow and record it in the table above.
