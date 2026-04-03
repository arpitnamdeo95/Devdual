import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  
  float a = atan(p.y, p.x);
  float r = length(p);
  
  // Create flowing liquid effect
  vec2 uv1 = uv;
  uv1.x += sin(uv.y * 10.0 + uTime * 0.5) * 0.05;
  uv1.y += cos(uv.x * 10.0 + uTime * 0.5) * 0.05;
  
  vec3 color1 = vec3(0.02, 0.0, 0.05);
  vec3 color2 = vec3(0.0, 0.3, 0.4);
  vec3 color3 = vec3(0.0, 0.8, 0.8);
  
  float noise = sin(uv1.x * 20.0 + uTime) * cos(uv1.y * 20.0 + uTime) * 0.5 + 0.5;
  vec3 finalColor = mix(color1, color2, noise);
  finalColor = mix(finalColor, color3, r * 0.5);
  
  // Deep dark vibe
  gl_FragColor = vec4(finalColor * 0.3, 1.0);
}
`;

const LiquidShaderMaterial = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uTime: { value: 0 },
      }}
      transparent
    />
  );
};

export const LiquidEther = () => {
  return (
    <div className="fixed inset-0 z-[-10] w-full h-full pointer-events-none opacity-50 mix-blend-screen">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <mesh>
          <planeGeometry args={[5, 5]} />
          <LiquidShaderMaterial />
        </mesh>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
    </div>
  );
};
