# GitHub Actions commit SHAs

The workflows in this repository pin third-party GitHub Actions to exact commit SHAs for supply-chain safety. Update the table below when bumping an action so that future reviews can quickly verify expected revisions.

| Action | Upstream tag | Commit SHA | Referenced in workflows |
| --- | --- | --- | --- |
| `actions/checkout` | `v4` | `08eba0b27e820071cde6df949e0beb9ba4906955` | `nextjs.yml`, `azure-webapps-node.yml` |
| `actions/setup-node` | `v4` | `49933ea5288caeca8642d1e84afbd3f7d6820020` | `nextjs.yml`, `azure-webapps-node.yml` |
| `actions/configure-pages` | `v5` | `983d7736d9b0ae728b81ab479565c72886d7745b` | `nextjs.yml` |
| `actions/cache` | `v4` | `0400d5f644dc74513175e3cd8d07132dd4860809` | `nextjs.yml` |
| `actions/upload-pages-artifact` | `v3` | `56afc609e74202658d3ffba0e8f6dda462b719fa` | `nextjs.yml` |
| `actions/deploy-pages` | `v4` | `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` | `nextjs.yml` |
| `actions/upload-artifact` | `v4` | `ea165f8d65b6e75b540449e92b4886f43607fa02` | `azure-webapps-node.yml` |
| `actions/download-artifact` | `v4` | `d3f86a106a0bac45b974a628896c90dbdf5c8093` | `azure-webapps-node.yml` |
| `azure/webapps-deploy` | `v2` | `3f1742a3b209ebd19d82b914f43fe1d6b919e536` | `azure-webapps-node.yml` |
| `actions/github-script` | `v6` | `00f12e3e20659f42342b1c0226afda7f7c042325` | `cleanup-branches.yml` |

## Updating the pins

Use `git ls-remote` to resolve a new tag to its commit when updating, for example:

```bash
git ls-remote https://github.com/actions/checkout refs/tags/v4
```

Replace the SHA in the workflow and record it in the table above.
