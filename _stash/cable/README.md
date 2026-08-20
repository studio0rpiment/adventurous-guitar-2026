# Early cable explorations (superseded)

- `CableRig.tsx` — the original two-pedal rig (stashed earlier).
- `HangingCable.tsx` + `CableRow.tsx` — the "row of cables hanging from hooks"
  step toward the wire-hair look, superseded by `PatchCable`/`PatchCables`
  (grab/seat into sockets). Parked 2026-08-20.

Note: `HangingCable` used `createHangingRope` and the `END_A/END_B/HOOK/
HANG_TOP` constants, which were removed from `src/three/cable/{verlet,constants}.ts`
in the same sweep — recover them from git history (or this note) if reviving.
