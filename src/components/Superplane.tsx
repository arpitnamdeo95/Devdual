
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Float, MeshDistortMaterial } from '@react-three/drei';

function MovingPlane() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // Custom geometry for a "cyber-grid" look
  const count = 40;
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        p.push(new THREE.Vector3(i - count/2, j - count/2, 0));
      }
    }
    return p;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(time * 0.1) * 0.2;
      meshRef.current.position.y = Math.cos(time * 0.2) * 0.5;
    }
  });

  return (
    <group ref={meshRef} rotation={[-Math.PI / 3, 0, 0]}>
      <mesh receiveShadow>
        <planeGeometry args={[100, 100, 64, 64]} />
        <MeshDistortMaterial
          color="#00F2FF"
          speed={2}
          distort={0.4}
          radius={1}
          metalness={0.8}
          roughness={0.2}
          wireframe
          opacity={0.15}
          transparent
        />
      </mesh>
      
      {/* Floating particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x * 2, p.y * 2, (Math.random() - 0.5) * 10]))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#00F2FF" transparent opacity={0.4} sizeAttenuation />
      </points>
    </group>
  );
}

export function Superplane() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#00F2FF" intensity={2} />
        <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} color="#C77DFF" intensity={1.5} />
        
        <Float speed={1.4} rotationIntensity={1.5} floatIntensity={2.3}>
          <MovingPlane />
        </Float>
      </Canvas>
    </div>
  );
}
