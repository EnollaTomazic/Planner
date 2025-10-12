# Plan to Fix Codex GitHub Action Failure

## Context
The GitHub Action `openai/codex-action@v1` is failing because it repeatedly attempts to read a server info JSON file (`/home/runner/.codex/18443098948.json`) that is missing, ultimately causing the workflow to exit with status 1.

## Goal
Restore the Codex action so that it can create or locate the required server info file and complete successfully without error.

## Step-by-Step Tasks
1. **Collect Workflow Metadata**  
   - Open the failing workflow run logs and note the job name, runner OS, and the action inputs.  
   - Confirm whether the failure reproduces on reruns or only on specific branches.

2. **Review Codex Action Configuration**  
   - Inspect `.github/workflows/` for jobs using `openai/codex-action@v1`.  
   - Check for required secrets or inputs (e.g., `OPENAI_API_KEY`, proxy settings) and ensure they are defined in repository settings.  
   - Verify whether a cached `server_info_file` path is being reused between runs.

3. **Trace Server Info Creation Logic**  
   - Read the action documentation to understand how the server info file should be generated.  
   - If the action expects an existing daemon, confirm whether a previous step should have launched it.  
   - Determine whether the path `/home/runner/.codex/` should be pre-created or if permissions are preventing file creation.

4. **Reproduce Locally (Optional)**  
   - Run the action locally using `act` or a comparable runner, mirroring the GitHub Actions environment.  
   - Observe whether the server info file is created and identify discrepancies with the hosted runner.

5. **Implement Fix**  
   - Adjust the workflow or repository configuration so the server info file is produced before the `read-server-info` step runs (for example, by adding a setup step or correcting action inputs).  
   - If necessary, patch the action usage to point to the correct server info path or version.

6. **Validate in CI**  
   - Push the workflow change to a branch and re-run the GitHub Action.  
   - Confirm that the run completes successfully without repeated `ENOENT` errors.

7. **Document Resolution**  
   - Record the root cause and remediation steps in the repository documentation (e.g., `docs/ci.md`) for future maintainers.  
   - Note any required environment variables or secrets that must remain configured.

## Deliverables
- Updated workflow configuration (if needed).
- Successful GitHub Action run confirming the fix.
- Documentation describing the resolution.
