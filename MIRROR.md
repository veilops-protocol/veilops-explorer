# Mirror notice

`veilops-protocol/veilops-explorer` is a **read-only mirror**. During Phase 01 the single source of truth is [`veilops-protocol/veilops`](https://github.com/veilops-protocol/veilops), path `apps/website/`.

- Open issues and pull requests on `veilops-protocol/veilops`, not here. Pull requests on this repository are closed with a pointer to the monorepo.
- History here is generated with `git subtree split`, so commits touching `apps/website/` keep their authors and messages. A final commit overlays this repository's `README.md`, `LICENSE` and `MIRROR.md`.
- The branch `main` is **force-pushed** on every sync. Do not base work on it.

## How the mirror is published

Run from a clean checkout of the monorepo, with the satellite files available at `../veilops-github/veilops-explorer/`:

```bash
# 1. Extract the history of apps/website/ into a local branch (deterministic: same input, same commits)
git subtree split --prefix=apps/website -b mirror/veilops-explorer

# 2. Overlay the mirror's own README, LICENSE and MIRROR.md on top of the split
git worktree add ../_mirror-veilops-explorer mirror/veilops-explorer
cp ../veilops-github/veilops-explorer/README.md ../veilops-github/veilops-explorer/LICENSE ../veilops-github/veilops-explorer/MIRROR.md ../_mirror-veilops-explorer/
git -C ../_mirror-veilops-explorer add README.md LICENSE MIRROR.md
git -C ../_mirror-veilops-explorer commit -m "mirror: add veilops-explorer README, LICENSE and MIRROR notice"

# 3. Publish
git push --force git@github.com:veilops-protocol/veilops-explorer.git mirror/veilops-explorer:main

# 4. Clean up
git worktree remove ../_mirror-veilops-explorer
git branch -D mirror/veilops-explorer
```

The mirror is updated manually by a maintainer in Phase 01. Automating it (a workflow in the monorepo with a deploy key scoped to this repository) is planned.
