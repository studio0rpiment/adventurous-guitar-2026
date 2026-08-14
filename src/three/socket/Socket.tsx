import type { GroupProps } from "@react-three/fiber";

const NUT = "#2e2b28"; // dark warm gunmetal hex nut
const CHROME = "#eef1f5"; // polished bright bevel
const HOLE = "#08080b"; // dark socket opening
const COPPER = "#b6763a"; // washer ring behind the nut

/**
 * Procedural 1/4" input-jack socket — just the visible top of the jack:
 *   dark hex nut  ->  polished chrome chamfered collar  ->  dark round hole,
 * with a hint of the copper washer behind. Faces +Z (toward the camera). `glow`
 * lights the chrome when a plug is approaching. `radius` scales the whole thing.
 */
export function Socket({
  radius = 0.34,
  glow = false,
  ...props
}: GroupProps & { radius?: number; glow?: boolean }) {
  const emissive = glow ? "#ffd28a" : "#000000";
  const emissiveIntensity = glow ? 1.4 : 0;
  return (
    <group {...props}>
      <group rotation-x={Math.PI / 2}>
        {/* copper washer peeking behind the nut */}
        <mesh position-y={-0.05}>
          <cylinderGeometry args={[radius * 1.06, radius * 1.06, 0.06, 40]} />
          <meshStandardMaterial color={COPPER} metalness={1} roughness={0.35} envMapIntensity={1} />
        </mesh>

        {/* dark hex mounting nut */}
        <mesh>
          <cylinderGeometry args={[radius, radius, 0.16, 6]} />
          <meshStandardMaterial color={NUT} metalness={1} roughness={0.45} envMapIntensity={0.9} />
        </mesh>

        {/* polished chrome chamfer funnelling in toward the hole (front wider) */}
        <mesh position-y={0.02}>
          <cylinderGeometry args={[radius * 0.62, radius * 0.44, 0.15, 40, 1, true]} />
          <meshStandardMaterial color={CHROME} metalness={1} roughness={0.06} envMapIntensity={1.3} emissive={emissive} emissiveIntensity={emissiveIntensity} side={2} />
        </mesh>

        {/* bright rim cap at the front of the chamfer */}
        <mesh position-y={0.095}>
          <ringGeometry args={[radius * 0.44, radius * 0.62, 40]} />
          <meshStandardMaterial color={CHROME} metalness={1} roughness={0.06} envMapIntensity={1.3} emissive={emissive} emissiveIntensity={emissiveIntensity} side={2} />
        </mesh>

        {/* dark socket hole (recessed inside the chamfer) */}
        <mesh position-y={-0.02}>
          <cylinderGeometry args={[radius * 0.4, radius * 0.4, 0.24, 32]} />
          <meshStandardMaterial color={HOLE} metalness={0.3} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
