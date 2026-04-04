import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const superPlaneVertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uFrequency;

  void main() {
    vUv = uv;
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Wave elevation based on time and distance from mouse
    float dist = distance(uv, uMouse);
    float wave = sin(dist * 10.0 - uTime * 2.0) * 0.15;
    float mousePulse = smoothstep(0.4, 0.0, dist) * 0.2;
    
    modelPosition.z += wave + mousePulse;
    vElevation = wave + mousePulse;
    
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
  }
`;

const superPlaneFragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uGlowColor;

  void main() {
    // Holographic grid line effect
    float strength = step(0.98, mod(vUv.x * 20.0, 1.0));
    strength += step(0.98, mod(vUv.y * 20.0, 1.0));
    
    // Base gradient
    vec3 color = mix(uColorA, uColorB, vUv.y + vElevation);
    
    // Add grid glow
    color = mix(color, uGlowColor, strength * 0.5);
    
    // Add elevation highlights
    color += vElevation * uGlowColor * 2.0;

    // Scanline effect
    float scanline = sin(vUv.y * 100.0 + uTime * 5.0) * 0.02;
    color += scanline;

    gl_FragColor = vec4(color, 0.8 + vElevation);
  }
`;

interface SuperplaneMaterialProps {
  colorA?: string;
  colorB?: string;
  glowColor?: string;
}

const SuperplaneMaterial: React.FC<SuperplaneMaterialProps> = ({ 
  colorA = '#001a1a', 
  colorB = '#004d4d', 
  glowColor = '#00f2ff' 
}) => {
  const meshRef = useRef<THREE.ShaderMaterial>(null);
  const { mouse } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uColorA: { value: new THREE.Color(colorA) },
    uColorB: { value: new THREE.Color(colorB) },
    uGlowColor: { value: new THREE.Color(glowColor) },
    uFrequency: { value: 3.0 }
  }), [colorA, colorB, glowColor]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Map mouse from [-1, 1] to [0, 1] for UV coordinates
      meshRef.current.uniforms.uMouse.value.set(
        (state.mouse.x + 1) / 2,
        (state.mouse.y + 1) / 2
      );
    }
  });

  return (
    <shaderMaterial
      ref={meshRef}
      vertexShader={superPlaneVertexShader}
      fragmentShader={superPlaneFragmentShader}
      uniforms={uniforms}
      transparent
      side={THREE.DoubleSide}
    />
  );
};

export const Superplane: React.FC<{ 
  className?: string;
  colorA?: string;
  colorB?: string;
  glowColor?: string;
  scale?: [number, number, number];
}> = ({ 
  className = "w-full h-full", 
  colorA, 
  colorB, 
  glowColor,
  scale = [4, 4, 1]
}) => {
  return (
    <div className={`${className} bg-transparent`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <mesh scale={scale}>
          <planeGeometry args={[1, 1, 64, 64]} />
          <SuperplaneMaterial colorA={colorA} colorB={colorB} glowColor={glowColor} />
        </mesh>
      </Canvas>
    </div>
  );
};
