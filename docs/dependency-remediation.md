# Dependency Vulnerability Remediation

When the CI audit step flags vulnerable packages, follow this playbook to resolve them quickly and keep the dependency tree healthy.

## 1. Inspect the report
- Review the **Dependency audit** section in the CI logs or job summary.
- Capture the `audit-report.json` artifact locally with `pnpm audit --json > audit-report.json` if you need the full dataset for triage.
- Note each high or critical severity package and the recommended fix guidance from the report.

## 2. Triage the vulnerability
- Confirm whether the vulnerable package is a direct dependency or a transitive one.
- Check the upstream advisory to understand exploitability in our context (runtime, tooling only, optional path, etc.).
- If the vulnerability is not exploitable for us, document the reasoning in the pull request and open a follow-up ticket to revisit when the upstream patch lands.

## 3. Remediate
- Prefer upgrading the affected package to the patched version suggested by the audit report.
- If an upgrade requires breaking changes, coordinate the change in the same pull request or create a chore ticket outlining the migration plan.
- When no fix is available, work with the owning team to evaluate temporary mitigations (pinning to a safe fork, vendor patch, or replacing the dependency).
- Avoid blanket `pnpm audit fix --force` runs; update only the packages necessary to resolve the flagged advisory.

## 4. Verify locally
- Run `pnpm audit --json` locally to ensure the vulnerability count drops to zero for high and critical severities.
- Execute `pnpm run verify-prompts` followed by `pnpm run check` to confirm gallery integrity, linting, tests, and type-checking still pass with the updated dependencies.

## 5. Document and ship
- Capture the remediation notes (version bumps, mitigation steps, or acceptance of risk) in the pull request description.
- Link to any upstream issues or advisories that track remaining work.
- Merge only after CI reports no high or critical vulnerabilities.

Following this workflow keeps the CI gate meaningful while ensuring we react to security advisories in a predictable, auditable way.
