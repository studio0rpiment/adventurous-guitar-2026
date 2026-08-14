import { PatchCable } from "./PatchCable";

// Random-ish perfect matching of the 16 sockets into 8 cable connections
// (every socket used once). Reshuffle to re-route. Each cable starts seated in
// its pair and can be unplugged / replugged anywhere.
const PAIRS: [number, number][] = [
  [0, 11],
  [1, 8],
  [2, 13],
  [3, 6],
  [4, 15],
  [5, 10],
  [7, 12],
  [9, 14],
];

const COLORS = [
  "#e0483d",
  "#e8801f",
  "#e8c020",
  "#57b24a",
  "#2fb0a0",
  "#3f7fe0",
  "#7a4fe0",
  "#d24ac0",
];

export function PatchCables() {
  return (
    <>
      {PAIRS.map(([i, j], k) => (
        <PatchCable key={k} color={COLORS[k % COLORS.length]} initialA={i} initialB={j} />
      ))}
    </>
  );
}
