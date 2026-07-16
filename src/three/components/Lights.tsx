/** Basic three-point-ish lighting for the placeholder scene. */
export function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-6, -2, -4]} intensity={0.6} color="#e8964a" />
    </>
  );
}
