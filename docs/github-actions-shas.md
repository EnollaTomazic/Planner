# GitHub Actions commit SHAs

The workflows in this repository pin third-party GitHub Actions to exact commit SHAs for supply-chain safety. Update the table below when bumping an action so that future reviews can quickly verify expected revisions.

| Action | Upstream tag | Commit SHA | Referenced in workflows |
| --- | --- | --- | --- |
| `actions/checkout` | `v5` | `08c6903cd8c0fde910a37f88322edcfb5dd907a8` | `ci.yml`, `visual-regression.yml` |
| `actions/setup-node` | `v5` | `a0853c24544627f65ddf259abe73b1d18a591444` | `ci.yml`, `visual-regression.yml` |
| `actions/configure-pages` | `v5` | `983d7736d9b0ae728b81ab479565c72886d7745b` | `ci.yml` (`pages-deploy`) |
| `actions/cache` | `v4` | `0400d5f644dc74513175e3cd8d07132dd4860809` | `ci.yml`, `visual-regression.yml` |
| `actions/upload-pages-artifact` | `v4` | `56afc609e74202658d3ffba0e8f6dda462b719fa` | `ci.yml` (`pages-deploy`) |
| `actions/deploy-pages` | `v4` | `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` | `ci.yml` (`pages-deploy`) |

## Updating the pins

Use `git ls-remote` to resolve a new tag to its commit when updating, for example:

```bash
git ls-remote https://github.com/actions/checkout refs/tags/v5
```

Replace the SHA in the workflow and record it in the table above.
