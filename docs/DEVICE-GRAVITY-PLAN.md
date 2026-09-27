# Device gravity for the cables (mobile) — plan

_2026-09-27. Live for all touch devices via the Physics button (`?physics=flip` still inverts the sensor sign). Files: `config/flags.ts`, `physics/gravity.ts`, `physics/useDeviceGravity.ts`, `ui/PhysicsToggle.tsx`; `stepRope` now takes a gravity vector._

On mobile, after the visitor turns on "physics" (sensors), the plugs stay fixed
in their sockets and the cables are pulled by the phone's real gravity. Held
upright, they hang down the screen. Flat on a table, they fall back into the
scene, "through the back of the phone." Whatever way the phone is held, the
cables show it. Shaking the phone jolts them.

## Approach

Use `devicemotion` → `accelerationIncludingGravity`, not `deviceorientation`
angles. It gives gravity and shaking in one reading. Held upright, the vector
points down the screen. Flat on a table, it points into the screen. Shaking
adds linear acceleration on top, so shakes come for free. The Verlet rope
already pins the plug ends and moves only the points between them, so the core
change is to turn gravity from a fixed downward value into a `Vector3` that
comes from the sensor.

## Details

- **Permission / "turn on physics" button.** iOS 13+ only allows motion access
  after `DeviceMotionEvent.requestPermission()` is called from a user tap.
  Android doesn't prompt but needs HTTPS (fine on Vercel). If permission is
  denied, the button goes back to off. Hide the button on desktop or wherever
  there's no sensor.
- **Mapping to scene space.** The sensor reports in the phone's own axes.
  Rotate the reading into world space with the camera quaternion, and correct
  for landscape with `screen.orientation.angle`. Lightly smooth it for a steady
  gravity direction, and pass the jittery part of each reading through as a
  shake impulse. Older iOS and Android report opposite signs, so check this on
  both phones.
- **Event-driven.** Each `devicemotion` event writes to a gravity ref, and the
  sim reads that ref on its existing render tick. When gravity changes by more
  than a small threshold, the sim wakes. When the phone is still, the existing
  sleep rule lets it rest. No new timers.
- **Modular pieces:**
  - `useDeviceGravity()` hook — owns the permission, the listener, the
    smoothing, and the mapping to world space.
  - `PhysicsToggle` UI component.
  - A gravity context/store that every `PatchCable` reads from.
  - `stepRope(...)` takes a gravity `Vector3` instead of a fixed value.
- **Flag.** Put it behind a flag in `config/ui.ts` so it can be tried on a
  phone before it goes live.

## Open questions

- **Falling "deeper."** If nothing sits behind the sockets, the cables drop
  away and shrink with perspective, which could look great. We may need a soft
  back limit so they don't disappear.
- **Docked cable.** The cable on the storage hook would swing too. Probably
  good.
- **Reduced motion.** Turn the feature off when `prefers-reduced-motion` is
  set.
