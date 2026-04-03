import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Text, Trail, PerspectiveCamera, Icosahedron, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

const CyberCore = () => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.x += delta * 0.2;
      outerRef.current.rotation.y += delta * 0.3;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.5;
      innerRef.current.rotation.y += delta * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.5;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2 + Math.PI / 2;
    }
  });

  return (
    <group position={[3, 0, -2]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
        {/* Core Energy */}
        <mesh ref={innerRef}>
          <Icosahedron args={[1.5, 3]}>
            <MeshDistortMaterial
              color="#00e5ff"
              emissive="#00e5ff"
              emissiveIntensity={3}
              distort={0.4}
              speed={2}
              wireframe
            />
          </Icosahedron>
        </mesh>
        
        {/* Outer Casing */}
        <mesh ref={outerRef}>
          <Icosahedron args={[2.2, 1]}>
            <meshStandardMaterial
              color="#030303"
              emissive="#1e3a8a"
              emissiveIntensity={0.8}
              wireframe
              transparent
              opacity={0.3}
            />
          </Icosahedron>
        </mesh>

        {/* Data Rings */}
        <group ref={ringRef}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[0, 0, (Math.PI * 2) / 3 * i]}>
              <torusGeometry args={[3 + i * 0.5, 0.015, 16, 100]} />
              <meshBasicMaterial color={i === 1 ? '#00e5ff' : '#00b3cc'} transparent opacity={0.6} />
              <Trail
                width={2}
                length={8}
                color={new THREE.Color(i === 1 ? '#00e5ff' : '#ffffff')}
                attenuation={(t) => t * t}
              >
                <mesh position={[3 + i * 0.5, 0, 0]}>
                  <sphereGeometry args={[0.1, 16, 16]} />
                  <meshBasicMaterial color={i === 1 ? '#00e5ff' : '#ffffff'} />
                </mesh>
              </Trail>
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  );
};

const FloatingPanel: React.FC<{ position: [number, number, number], rotation: [number, number, number], text: string }> = ({ position, rotation, text }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation}>
        <planeGeometry args={[5, 2.5]} />
        <meshBasicMaterial color="#0e0e0e" transparent opacity={0.6} side={THREE.DoubleSide} />
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[5.02, 2.52]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.3} />
        </mesh>
        <Text
          position={[-2.3, 1, 0.05]}
          fontSize={0.12}
          color="#e5e2e1"
          anchorX="left"
          anchorY="top"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v13/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOV.woff"
          maxWidth={4.6}
        >
          {text}
        </Text>
      </mesh>
    </Float>
  );
};

const GridFloor = () => {
  return (
    <group position={[0, -4, 0]}>
      <gridHelper args={[100, 100, '#00e5ff', '#1e293b']} position={[0, -0.01, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#030303" transparent opacity={0.97} />
      </mesh>
    </group>
  );
};

const SceneElements = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const pointer = useRef(new THREE.Vector2());
  
  useFrame((state) => {
    pointer.current.x = THREE.MathUtils.lerp(pointer.current.x, (state.mouse.x * Math.PI) / 8, 0.05);
    pointer.current.y = THREE.MathUtils.lerp(pointer.current.y, (state.mouse.y * Math.PI) / 8, 0.05);
    
    state.camera.position.x = pointer.current.x * 3;
    state.camera.position.y = pointer.current.y * 3 + 2;
    state.camera.position.z = 12;
    state.camera.lookAt(0, 0, 0);
  });

  const codeSnippets = useMemo(() => [
    `export const initMatchmaking = async (req, res) => {\n  const p1 = await queue.pop();\n  const p2 = await queue.pop();\n  const arenaId = uuidv4();\n  await redis.set(\`match:\${arenaId}\`, { p1, p2, status: 'READY' });\n  logger.info(\`[MATCHMAKER] Arena \${arenaId} initialized.\`);\n}`,
    `// [SYS] Threat detected in chunk 0x0A4...\n// [SYS] Isolating sandbox environment...\nconsole.log(btoa("ARENA_BREACH_ATTEMPT"));\nSystem.exit(1);`
  ], []);

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 2, 12]} fov={50} />
      
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#00e5ff" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#1e3a8a" />

      <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={1} />
      <Sparkles count={150} scale={12} size={1.5} speed={0.4} opacity={0.5} color="#00e5ff" />
      
      <GridFloor />
      <CyberCore />
      
      {/* Code Panels */}
      <FloatingPanel position={[-5, 3, -2]} rotation={[0, Math.PI / 8, 0]} text={codeSnippets[0]} />
      <FloatingPanel position={[-6, -1, 1]} rotation={[0, Math.PI / 4, 0]} text={codeSnippets[1]} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export const Hero3DScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#030303]">
      <Canvas dpr={[1, 2]} gl={{ antialias: false }}>
        <SceneElements />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030303_100%)] pointer-events-none opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </div>
  );
};
