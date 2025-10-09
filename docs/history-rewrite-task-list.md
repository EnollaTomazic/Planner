# History Rewrite Task Breakdown

Use this checklist to split the oversized commit `76fe671` into reviewable changes and raise focused pull requests. Each task builds on the previous one, so work through them sequentially.

## Preparation
- [ ] Ensure the working tree is clean with `git status -sb`.
- [ ] Create a safety tag so the original history can be restored: `git tag backup/pre-split`.
- [ ] Confirm the rebase span (17 commits) with `git log --oneline HEAD~17..`.

## Interactive rebase
- [ ] Start rewriting history: `git rebase -i --rebase-merges HEAD~17`.
- [ ] Mark commit `76fe67159f26` as `edit` in the todo list and save.

## Split the oversized commit
- [ ] When the rebase stops, run `git reset HEAD^` to unstage the commit contents.
- [ ] Stage only the refactor files (helper, configs, scripts, tests) and commit with `git commit -m "refactor: centralize base path normalization"`.
- [ ] Stage the generated manifest separately and commit with `git commit -m "chore: regenerate gallery manifest"`.
- [ ] Continue the rebase: `git rebase --continue`, resolving any follow-up conflicts.

## Post-rebase verification
- [ ] Inspect the rewritten history using `git log --oneline --stat HEAD~4..`.
- [ ] Force-push the updated branch with `git push --force-with-lease origin work`.

## Branch and PR creation
- [ ] Create `refactor/base-path-normalization` from `origin/main` and cherry-pick the refactor commit.
- [ ] Run quality checks (`pnpm run check`) and push the branch.
- [ ] Create a PR titled `refactor: centralize base path normalization`.
- [ ] Create `chore/generated-artifacts`, add the `.gitattributes` entry, cherry-pick the manifest commit, and push.
- [ ] Open a PR titled `chore: regenerate gallery manifest` noting that diffs are hidden for generated files.

## Rollback safety net
- [ ] If anything goes wrong, abort the rebase with `git rebase --abort`.
- [ ] Restore the original branch using `git reset --hard backup/pre-split` (or `ORIG_HEAD` if the tag was skipped).
- [ ] Force-push the backup reference to undo remote changes if necessary.
