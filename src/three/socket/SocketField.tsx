import { Socket } from "./Socket";
import { SOCKETS } from "./layout";
import { useConnection } from "@/three/connection/ConnectionContext";

export function SocketField() {
  const { aligningId } = useConnection();
  return (
    <>
      {SOCKETS.map((s, i) => (
        <Socket key={i} position={s.pos} rotation={[0, 0, s.rz]} radius={s.r} glow={aligningId === i} />
      ))}
    </>
  );
}
