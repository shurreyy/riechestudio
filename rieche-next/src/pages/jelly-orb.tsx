import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

// Three.js types
declare global {
  interface Window {
    THREE: any;
  }
}

interface JellyOrbProps {}

const JellyOrb: React.FC<JellyOrbProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const orbRef = useRef<any>(null);
  const animationIdRef = useRef<number>(0);
  
  // Physics properties
  const [elasticity, setElasticity] = useState(0.4);
  const [damping, setDamping] = useState(0.92);
  const [brushSize, setBrushSize] = useState(0.3);
  const [viscosity, setViscosity] = useState(0.005);
  
  // Mouse state
  const mouseRef = useRef<any>(null);
  const raycasterRef = useRef<any>(null);
  const isMouseDownRef = useRef(false);
  
  // Vertex data for jelly effect
  const originalPositionsRef = useRef<any[]>([]);
  const currentPositionsRef = useRef<any[]>([]);
  const velocitiesRef = useRef<any[]>([]);
  const forcesRef = useRef<any[]>([]);

  useEffect(() => {
    // Load Three.js dynamically
    const loadThreeJS = async () => {
      if (typeof window !== 'undefined' && !window.THREE) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => {
          init();
        };
        document.head.appendChild(script);
      } else if (window.THREE) {
        init();
      }
    };

    loadThreeJS();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const init = () => {
    if (!window.THREE || !canvasRef.current) return;

    const THREE = window.THREE;

    // Scene setup
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current.position.z = 5;

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvasRef.current });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setClearColor(0x000000, 0);

    // Initialize mouse and raycaster
    mouseRef.current = new THREE.Vector2();
    raycasterRef.current = new THREE.Raycaster();

    // Create jelly orb geometry
    createJellyOrb();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    sceneRef.current.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00ff88, 0.5, 100);
    pointLight.position.set(-10, -10, 10);
    sceneRef.current.add(pointLight);

    // Event listeners
    setupEventListeners();

    // Start animation
    animate();
  };

  const createJellyOrb = () => {
    if (!window.THREE) return;

    const THREE = window.THREE;

    // Create a detailed sphere geometry
    const geometry = new THREE.SphereGeometry(2, 64, 32);

    // Store original positions
    const positions = geometry.attributes.position.array;
    originalPositionsRef.current = [];
    currentPositionsRef.current = [];
    velocitiesRef.current = [];
    forcesRef.current = [];

    for (let i = 0; i < positions.length; i += 3) {
      const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      originalPositionsRef.current.push(vertex.clone());
      currentPositionsRef.current.push(vertex.clone());
      velocitiesRef.current.push(new THREE.Vector3(0, 0, 0));
      forcesRef.current.push(new THREE.Vector3(0, 0, 0));
    }

    // Create material with iridescent effect
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x4a90e2,
      metalness: 0.2,
      roughness: 0.1,
      envMapIntensity: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.9
    });

    // Add some rainbow reflection
    const loader = new THREE.CubeTextureLoader();
    const textureCube = loader.load([
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAwZmZmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2ZmMDBmZiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAwZmYwMCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2ZmZmYwMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2ZmMDAwMCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwMDBmZiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2ZmZmYwMCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwZmZmZiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2ZmMDBmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwZmYwMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAwMDBmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2ZmMDAwMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4='
    ]);

    material.envMap = textureCube;

    orbRef.current = new THREE.Mesh(geometry, material);
    sceneRef.current.add(orbRef.current);
  };

  const updateJellyPhysics = () => {
    if (!orbRef.current || !raycasterRef.current || !mouseRef.current || !cameraRef.current) return;

    const mouseForce = isMouseDownRef.current ? 2.0 : 1.0;

    for (let i = 0; i < currentPositionsRef.current.length; i++) {
      const current = currentPositionsRef.current[i];
      const original = originalPositionsRef.current[i];
      const velocity = velocitiesRef.current[i];
      const force = forcesRef.current[i];

      // Reset forces
      force.set(0, 0, 0);

      // Mouse interaction
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObject(orbRef.current);

      if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;
        const distance = current.distanceTo(intersectionPoint);

        if (distance < brushSize) {
          const direction = current.clone().sub(intersectionPoint).normalize();
          const strength = (brushSize - distance) / brushSize;
          const pushForce = direction.multiplyScalar(strength * 0.1 * mouseForce);
          force.add(pushForce);
        }
      }

      // Spring force back to original position
      const springForce = original.clone().sub(current).multiplyScalar(elasticity);
      force.add(springForce);

      // Apply viscosity
      const viscosityForce = velocity.clone().multiplyScalar(-viscosity);
      force.add(viscosityForce);

      // Update velocity and position
      velocity.add(force);
      velocity.multiplyScalar(damping);
      current.add(velocity);
    }

    // Update geometry
    const positions = orbRef.current.geometry.attributes.position.array;
    for (let i = 0; i < currentPositionsRef.current.length; i++) {
      const pos = currentPositionsRef.current[i];
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
    }

    orbRef.current.geometry.attributes.position.needsUpdate = true;
    orbRef.current.geometry.computeVertexNormals();
  };

  const setupEventListeners = () => {
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseRef.current) return;
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleMouseDown = () => {
      isMouseDownRef.current = true;
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  };

  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !orbRef.current) return;

    // Rotate the orb slowly
    orbRef.current.rotation.y += 0.005;
    orbRef.current.rotation.x += 0.002;

    // Update jelly physics
    updateJellyPhysics();

    // Change material color over time for extra visual appeal
    const time = Date.now() * 0.001;
    orbRef.current.material.color.setHSL((time * 0.1) % 1, 0.7, 0.6);

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(animate);
  };

  return (
    <>
      <Head>
        <title>Interactive Jelly Orb</title>
      </Head>
      
      <div style={{
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        width: '100vw',
        height: '100vh'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '10px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)'
        }}>
          Jelly Orb Simulation<br />
          <small>Move mouse to deform • Click and drag for stronger effect</small>
        </div>

        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '12px',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '10px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ margin: '5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label>Elasticity:</label>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.01"
              value={elasticity}
              onChange={(e) => setElasticity(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
          </div>
          <div style={{ margin: '5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label>Damping:</label>
            <input
              type="range"
              min="0.85"
              max="0.99"
              step="0.01"
              value={damping}
              onChange={(e) => setDamping(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
          </div>
          <div style={{ margin: '5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label>Brush Size:</label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={brushSize}
              onChange={(e) => setBrushSize(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
          </div>
          <div style={{ margin: '5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label>Viscosity:</label>
            <input
              type="range"
              min="0.001"
              max="0.02"
              step="0.001"
              value={viscosity}
              onChange={(e) => setViscosity(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
          </div>
        </div>

        <canvas
          ref={canvasRef}
          style={{ display: 'block' }}
        />
      </div>
    </>
  );
};

export default JellyOrb; 