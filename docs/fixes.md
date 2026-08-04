# Pending fixes

How the `patched` channel is built. The [README](../README.md) carries the table of fixes still waiting on upstream.

The `patched` channel installs a prebuilt framework tarball from the
[conformance-build release](https://github.com/unpunnyfuns/storybook-tanstack-conformance/releases/tag/conformance-build):
`storybook@next` plus these fixes, built from
[unpunnyfuns/storybook#conformance-build](https://github.com/unpunnyfuns/storybook/tree/conformance-build).
A scheduled workflow rebuilds the tarball whenever the framework changes
upstream or a fix branch moves; a failed rebuild means the pending PRs need
a rebase, and the release keeps serving the last good build meanwhile. The
`patched` row therefore shows what `next` looks like once these are merged:

Fixes that have merged upstream are dropped from that table rather than kept with a "merged" marker. Once the change is in the upstream repository it is canon there, and a local list of it only goes stale; git history holds what was tracked and when.
