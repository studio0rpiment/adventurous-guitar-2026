# Max/MSP-era components (on hold)

Parked here 2026-08-20 during a dead-code sweep. These are the unmounted
remains of the Max/MSP "patch" visual direction (see
`docs/HANDOFF.md` Part II) — kept revivable, but out of `src/` so they no
longer typecheck/build with the live cable-scene app:

- `PatchField.tsx` — orthographic brick wall reconstructing the stage photo,
  hover-roll per brick.
- `MenuBricks.tsx` — the four menu items as thin object bricks.
- `Backdrop.tsx` — full-screen stage-photo background with dim overlay.

To revive, move back under `src/` and re-mount. Note the live `src` has since
dropped some things they referenced (nothing structural — they imported only
`@/config/media`, which still exists).
