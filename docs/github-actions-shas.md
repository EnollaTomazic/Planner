# GitHub Actions commit SHAs

The workflows in this repository pin third-party GitHub Actions to exact commit SHAs for supply-chain safety. Update the table below when bumping an action so that future reviews can quickly verify expected revisions.

| Action | Upstream tag | Commit SHA | Referenced in workflows |
| --- | --- | --- | --- |
| `actions/checkout` | `v5` | `08c6903cd8c0fde910a37f88322edcfb5dd907a8` | `ci.yml`, `node-base.yml` |
| `actions/setup-node` | `v5` | `a0853c24544627f65ddf259abe73b1d18a591444` | `ci.yml`, `node-base.yml` |
| `actions/cache` | `v4` | `0400d5f644dc74513175e3cd8d07132dd4860809` | `node-base.yml` |
| `actions/upload-artifact` | `v4` | `b4b15b8c7f4b6d1b79c82b9e19016f539166271c` | `node-base.yml` |

## Updating the pins

Use `git ls-remote` to resolve a new tag to its commit when updating, for example:

```bash
git ls-remote https://github.com/actions/checkout refs/tags/v5
```

Replace the SHA in the workflow and record it in the table above.
