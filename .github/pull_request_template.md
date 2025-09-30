## Summary
-

## Testing
- [ ] `npm run verify-prompts`
- [ ] `npm run check`

## Rollback Plan
- [ ] Toggle `NEXT_PUBLIC_DEPTH_THEME` to `off`/`0` and redeploy to restore the legacy depth tokens and components.
- [ ] Capture any residual depth-theme metrics to confirm the flag has returned to the legacy path.

## Monitoring
- [ ] Depth-theme analytics flag is visible in dashboards and alerting remains green.
