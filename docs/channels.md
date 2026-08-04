# Channels

Why the suite measures three framework builds from one branch, and how the selection works.

Everything lives on one branch. Which framework build the suite measures is a
channel, selected by rewriting the apps' dependency specs:

| Channel   | Framework                                            |
| --------- | ---------------------------------------------------- |
| `main`    | stock `storybook@latest`                             |
| `next`    | stock `storybook@next` (latest alpha)                |
| `patched` | `storybook@next` plus the pending fixes listed below |

```bash
node scripts/channel.mjs next   # point every app at a channel
npm install
git checkout -- apps            # back to the committed channel (main)
```

Channels used to be git branches whose entire diff was these dependency
specs. That meant cherry-picking every change three times, and a partial
rollout once left three apps on the `next` branch silently measuring
`latest`. The script hits all apps or none.

A daily CI run selects each channel in turn, installs its current
resolutions from scratch, runs every app's suite, and publishes the counts
to the `status` branch, which feeds the badges above. No automated commits
ever land on `main`; the badges are the record.
