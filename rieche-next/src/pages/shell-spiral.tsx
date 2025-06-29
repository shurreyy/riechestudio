import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import ShellSpiralBackground from "../components/ShellSpiralBackground";

// Three.js types
declare global {
  interface Window {
    THREE: any;
  }
}

interface ShellSpiralProps {}

const ShellSpiral: React.FC<ShellSpiralProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number>(0);
  
  // Shell parameters
  const [currentShell, setCurrentShell] = useState('nautilus');
  const [sections, setSections] = useState(600);
  const [swidth, setSwidth] = useState(40);
  const [sheight, setSheight] = useState(40);
  const [cutx, setCutx] = useState(-200);
  const [cuty, setCuty] = useState(0);
  const [cutw, setCutw] = useState(100);
  const [cuth, setCuth] = useState(150);
  const [orbits, setOrbits] = useState(6);
  const [tilt, setTilt] = useState(0);
  const [bend, setBend] = useState(-Math.PI / 9);
  const [xstretch, setXstretch] = useState(1);
  const [ystretch, setYstretch] = useState(0);
  const [ovel, setOvel] = useState(1);
  
  // Camera and interaction
  const [zoom, setZoom] = useState(1);
  const [orbitX, setOrbitX] = useState(0);
  const [orbitY, setOrbitY] = useState(-Math.PI / 2);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  
  const e = 2.71828;
  const PI = Math.PI;
  const TAU = 2 * Math.PI;

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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    sceneRef.current.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7a3d43, 1, 100);
    pointLight.position.set(0, 0, 10);
    sceneRef.current.add(pointLight);

    // Event listeners
    setupEventListeners();

    // Start animation
    animate();
  };

  const createShellSection = () => {
    if (!window.THREE) return null;

    const THREE = window.THREE;

    // Create ellipsoid geometry for the main section
    const ellipsoidGeometry = new THREE.SphereGeometry(1, 36, 36);
    ellipsoidGeometry.scale(swidth / 100, sheight / 100, swidth / 100);

    // Create material
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.3,
      transparent: true,
      opacity: 0.8,
      specular: 0xffffff,
      shininess: 100
    });

    const section = new THREE.Mesh(ellipsoidGeometry, material);
    return section;
  };

  const setupEventListeners = () => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX - window.innerWidth / 2);
      setMouseY(event.clientY - window.innerHeight / 2);
    };

    const handleMouseDown = () => {
      setIsMouseDown(true);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    const handleWheel = (event: WheelEvent) => {
      setZoom(prev => Math.max(0.1, Math.min(3, prev + event.deltaY / 1000)));
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        restoreTilt();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyPress);
    };
  };

  const restoreTilt = () => {
    setOrbitX(0);
    setOrbitY(-Math.PI / 2);
    setZoom(1);
    setTimeout(() => setOrbitY(Math.PI / 12), 2500);
  };

  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !window.THREE) return;

    const THREE = window.THREE;
    setFrameCount(prev => prev + 1);

    // Update orbit based on mouse
    if (isMouseDown && mouseX > 150) {
      setOrbitX(prev => prev + mouseX / 1000);
      setOrbitY(prev => prev - mouseY / 2000);
    }

    // Clear scene
    while (sceneRef.current.children.length > 0) {
      sceneRef.current.remove(sceneRef.current.children[0]);
    }

    // Re-add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    sceneRef.current.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7a3d43, 1, 100);
    pointLight.position.set(2 * mouseX / 100, mouseY / 200, mouseY / 100);
    sceneRef.current.add(pointLight);

    // Create shell section
    const section = createShellSection();
    if (!section) return;

    // Draw preview
    const preview = section.clone();
    preview.position.set(-window.innerWidth / 2 + 75, window.innerHeight / 2 - (sheight + 50), 0);
    preview.rotation.y = frameCount / 60;
    sceneRef.current.add(preview);

    // Main shell generation
    const layers = Math.min(frameCount * 5, sections);
    let y = -200 * ystretch;

    for (let i = 0; i < layers; i++) {
      const a = (i / sections) * 8 * TAU;
      const r = Math.pow(e, a * (1 / Math.tan(PI / 2.13))); // Natural log magic!
      y += ystretch * r / (sections / orbits);

      const shellPiece = section.clone();
      
      shellPiece.position.set(0, ystretch * y, 0);
      shellPiece.rotation.y = -ovel * a + Math.PI / 2;
      shellPiece.rotation.z = tilt;
      shellPiece.position.x = xstretch * r;
      shellPiece.rotation.y += bend;
      shellPiece.scale.setScalar(Math.max(0, Math.min(1.5, r / 120)));
      shellPiece.rotation.y += Math.PI;

      sceneRef.current.add(shellPiece);
    }

    // Camera transformations
    cameraRef.current.position.set(0, 0, 5);
    cameraRef.current.lookAt(0, 0, 0);

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(animate);
  };

  const setShellParameters = (shellType: string) => {
    setCurrentShell(shellType);
    setFrameCount(0);

    switch (shellType) {
      case 'clam':
        setSections(300);
        setSwidth(70);
        setSheight(100);
        setCutx(-500);
        setCuty(-500);
        setCutw(100);
        setCuth(150);
        setOrbits(8);
        setTilt(0);
        setBend(Math.PI / 12);
        setXstretch(0.8);
        setYstretch(0.4);
        setOvel(0.12);
        break;
      case 'nautilus':
        setSections(600);
        setSwidth(40);
        setSheight(40);
        setCutx(-200);
        setCuty(0);
        setCutw(100);
        setCuth(150);
        setOrbits(6);
        setTilt(0);
        setBend(-Math.PI / 9);
        setXstretch(1);
        setYstretch(0);
        setOvel(1);
        break;
      case 'olive':
        setSections(600);
        setSwidth(30);
        setSheight(120);
        setCutx(0);
        setCuty(90);
        setCutw(100);
        setCuth(150);
        setOrbits(8);
        setTilt(Math.PI / 18);
        setBend(0);
        setXstretch(0.35);
        setYstretch(0.92);
        setOvel(1);
        break;
      case 'periwinkle':
        setSections(600);
        setSwidth(50);
        setSheight(55);
        setCutx(-200);
        setCuty(0);
        setCutw(100);
        setCuth(150);
        setOrbits(6);
        setTilt(Math.PI / 3);
        setBend(0);
        setXstretch(0.75);
        setYstretch(0.5);
        setOvel(1);
        break;
      case 'turritella':
        setSections(600);
        setSwidth(20);
        setSheight(25);
        setCutx(-200);
        setCuty(0);
        setCutw(100);
        setCuth(150);
        setOrbits(16);
        setTilt(-Math.PI / 24);
        setBend(0);
        setXstretch(0.3);
        setYstretch(0.9);
        setOvel(3);
        break;
      case 'whelk':
        setSections(600);
        setSwidth(50);
        setSheight(120);
        setCutx(30);
        setCuty(80);
        setCutw(100);
        setCuth(150);
        setOrbits(8);
        setTilt(Math.PI / 12);
        setBend(0);
        setXstretch(0.55);
        setYstretch(1);
        setOvel(1);
        break;
    }
    restoreTilt();
  };

  return (
    <>
      <Head>
        <title>Shell Spiral Generator</title>
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
          Shell Spiral Generator<br />
          <small>Click and drag to rotate • Scroll to zoom • Space to reset</small>
        </div>

        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          {[
            { name: 'Clam', key: 'clam' },
            { name: 'Nautilus', key: 'nautilus' },
            { name: 'Olive', key: 'olive' },
            { name: 'Periwinkle', key: 'periwinkle' },
            { name: 'Turritella', key: 'turritella' },
            { name: 'Whelk', key: 'whelk' }
          ].map((shell) => (
            <button
              key={shell.key}
              onClick={() => setShellParameters(shell.key)}
              style={{
                width: '100px',
                padding: '8px',
                backgroundColor: currentShell === shell.key ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentShell !== shell.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentShell !== shell.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
            >
              {shell.name}
            </button>
          ))}
        </div>

        <canvas
          ref={canvasRef}
          style={{ display: 'block' }}
        />
      </div>

      <ShellSpiralBackground 
        shellType="clam"
        showControls={true}
        opacity={0.5}
      />
    </>
  );
};

export default ShellSpiral; 