import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Layer {
  active: boolean;
  R: number;
  r: number;
  p: number;
}

interface Layers {
  1: Layer;
  2: Layer;
  3: Layer;
}

type Palette = 'white' | 'sage' | 'ocean' | 'warm' | 'nature' | 'purple';

const palettes = {
  white: ['#ffffff', '#f8fafc', '#e2e8f0'],
  sage: ['#9CA986', '#B8C5A6', '#A8B691'],
  ocean: ['#4F9CF9', '#7BB3F0', '#6BADF7'],
  warm: ['#F59E0B', '#F97316', '#FB923C'],
  nature: ['#10B981', '#34D399', '#6EE7B7'],
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD']
};

const presets = {
  mandala: {
    layers: { 1: true, 2: true, 3: true },
    R1: 120, r1: 45, p1: 25,
    R2: 90, r2: 30, p2: 18,
    R3: 150, r3: 75, p3: 35
  },
  flower: {
    layers: { 1: true, 2: true, 3: false },
    R1: 100, r1: 35, p1: 20,
    R2: 80, r2: 25, p2: 15,
    R3: 120, r3: 60, p3: 30
  },
  galaxy: {
    layers: { 1: true, 2: true, 3: true },
    R1: 150, r1: 60, p1: 40,
    R2: 100, r2: 40, p2: 25,
    R3: 80, r3: 25, p3: 15
  },
  chakra: {
    layers: { 1: true, 2: true, 3: true },
    R1: 110, r1: 40, p1: 30,
    R2: 85, r2: 25, p2: 20,
    R3: 140, r3: 70, p3: 50
  },
  customLayer1: {
    layers: { 1: true, 2: false, 3: false },
    R1: 130, r1: 46, p1: 19,
    R2: 90,  r2: 30, p2: 18,
    R3: 150, r3: 75, p3: 35
  },
  accentLayer3: {
    layers: { 1: false, 2: false, 3: true },
    R1: 120, r1: 45, p1: 25,
    R2: 90,  r2: 30, p2: 18,
    R3: 200, r3: 18, p3: 79
  },
  nautilus: {
    layers: { 1: true, 2: false, 3: false },
    R1: 150, r1: 49, p1: 49,
    R2: 90,  r2: 30, p2: 18,
    R3: 150, r3: 75, p3: 35
  },
  vortex: {
    layers: { 1: true, 2: false, 3: false },
    R1: 105, r1: 52, p1: 79,
    R2: 90,  r2: 30, p2: 79,
    R3: 150, r3: 75, p3: 35
  },
  radiant: {
    layers: { 1: true, 2: false, 3: false },
    R1: 155, r1: 52, p1: 47,
    R2: 90,  r2: 30, p2: 79,
    R3: 150, r3: 75, p3: 35
  }
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export default function AdvancedSpirograph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [currentPalette, setCurrentPalette] = useState<Palette>('white');
  const [speed, setSpeed] = useState(20);
  const [lineWidth, setLineWidth] = useState(0.8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [layers, setLayers] = useState<Layers>({
    1: { active: true, R: 120, r: 45, p: 25 },
    2: { active: true, R: 90, r: 30, p: 18 },
    3: { active: false, R: 150, r: 75, p: 35 }
  });
  const [spiralMode, setSpiralMode] = useState(false);
  const [spiralGrowthRate, setSpiralGrowthRate] = useState(0.1);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setIsDrawing(false);
    }
  };

  const drawSpirograph = (R: number, r: number, p: number, color: string, opacity: number = 0.8): Promise<void> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve();
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve();

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxT = 2 * Math.PI * R / gcd(R, r);
      const increment = 0.02; // fixed small increment for smoothness
      let t = 0;
      let prevX = centerX + (R - r) * Math.cos(0) + p * Math.cos((R - r) * 0 / r);
      let prevY = centerY + (R - r) * Math.sin(0) - p * Math.sin((R - r) * 0 / r);

      const animate = () => {
        if (t > maxT) {
          resolve();
          return;
        }

        ctx.globalAlpha = opacity;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < speed && t <= maxT; i++) {
          let dynamicP = p;
          if (spiralMode) {
            dynamicP = p + t * spiralGrowthRate;
          }
          const x = centerX + (R - r) * Math.cos(t) + dynamicP * Math.cos((R - r) * t / r);
          const y = centerY + (R - r) * Math.sin(t) - dynamicP * Math.sin((R - r) * t / r);
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
          prevX = x;
          prevY = y;
          t += increment;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    });
  };

  const drawAllLayers = async () => {
    if (isDrawing) return;
    
    clearCanvas();
    setIsDrawing(true);

    const promises: Promise<void>[] = [];
    
    // Draw each active layer
    for (let i = 1; i <= 3; i++) {
      if (layers[i as keyof Layers].active) {
        const layer = layers[i as keyof Layers];
        const color = palettes[currentPalette][i - 1] || palettes[currentPalette][0];
        const opacity = i === 1 ? 0.9 : (i === 2 ? 0.7 : 0.5);
        
        // Convert hex to rgb for proper opacity
        const rgb = hexToRgb(color);
        if (rgb) {
          const rgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
          promises.push(drawSpirograph(layer.R, layer.r, layer.p, rgbaColor, 1.0));
        }
      }
    }

    await Promise.all(promises);
    setIsDrawing(false);
  };

  const toggleLayer = (layerNum: keyof Layers) => {
    setLayers(prev => ({
      ...prev,
      [layerNum]: { ...prev[layerNum], active: !prev[layerNum].active }
    }));
  };

  const updateLayer = (layerNum: keyof Layers, property: keyof Layer, value: number) => {
    setLayers(prev => ({
      ...prev,
      [layerNum]: { ...prev[layerNum], [property]: value }
    }));
  };

  const setColorPalette = (palette: Palette) => {
    setCurrentPalette(palette);
  };

  const applyPreset = (preset: keyof typeof presets) => {
    const config = presets[preset];
    
    setLayers({
      1: { active: config.layers[1], R: config.R1, r: config.r1, p: config.p1 },
      2: { active: config.layers[2], R: config.R2, r: config.r2, p: config.p2 },
      3: { active: config.layers[3], R: config.R3, r: config.r3, p: config.p3 }
    });
  };

  const redrawSpirograph = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      }
    setIsDrawing(false);
    setTimeout(drawAllLayers, 100);
  };

  const paletteOptions: Palette[] = ['white', 'sage', 'ocean', 'warm', 'nature', 'purple'];
  const randomizeLayers = () => {
    // Randomly determine active states
    let activeStates = [Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5];
    // Ensure at least one layer is active
    if (!activeStates[0] && !activeStates[1] && !activeStates[2]) {
      const randomIndex = Math.floor(Math.random() * 3);
      activeStates[randomIndex] = true;
    }
    setLayers({
      1: {
        active: activeStates[0],
        R: Math.floor(Math.random() * 151) + 50, // 50-200
        r: Math.floor(Math.random() * 91) + 10,  // 10-100
        p: Math.floor(Math.random() * 76) + 5    // 5-80
      },
      2: {
        active: activeStates[1],
        R: Math.floor(Math.random() * 151) + 50,
        r: Math.floor(Math.random() * 91) + 10,
        p: Math.floor(Math.random() * 76) + 5
      },
      3: {
        active: activeStates[2],
        R: Math.floor(Math.random() * 151) + 50,
        r: Math.floor(Math.random() * 91) + 10,
        p: Math.floor(Math.random() * 76) + 5
      }
    });
    setCurrentPalette('white');
    setSpeed(Math.floor(Math.random() * 1000) + 1);
    setLineWidth(parseFloat((Math.random() * 1.8 + 0.2).toFixed(2)));
  };

  useEffect(() => {
    redrawSpirograph();
  }, [layers, currentPalette, speed, lineWidth]);

  return (
    <>
      <Head>
        <title>Advanced Spirograph | RIECHE</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Navigation */}
      <nav className="w-full h-30 bg-[#D9DED8] px-10 flex justify-between items-center fixed top-0 z-50 backdrop-blur-md border-b border-black/10">
        <div className="flex flex-col">
          <Link href="/" className="no-underline">
            <div className="font-['The_Seasons'] text-5xl font-normal leading-[43px] text-black">RIECHE</div>
            <div className="font-['The_Seasons'] text-3xl font-normal leading-[25px] text-black">Pilates Studio</div>
          </Link>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/philosophy" className="text-base font-medium text-black no-underline hover:opacity-70 transition-opacity duration-300">Rieche Philosophy</Link>
          <Link href="/quiz" className="text-base font-medium text-black no-underline hover:opacity-70 transition-opacity duration-300">Quiz</Link>
          <Link href="/building-rieche" className="text-base font-medium text-black no-underline hover:opacity-70 transition-opacity duration-300">Building RIECHE</Link>
          <Link href="/the-room" className="text-base font-medium text-black no-underline hover:opacity-70 transition-opacity duration-300">The Room</Link>
          <a href="#contact" className="px-5 py-3 bg-black rounded-lg text-white text-sm font-medium no-underline transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 shadow-sm">Contact us</a>
        </div>
      </nav>

      <div className="flex max-w-[1400px] mx-auto mt-35 mb-10 px-5 py-10 gap-10">
        <div className="flex-1 flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="font-['The_Seasons'] text-4xl font-normal text-[#1a1a1a] mb-2">Sacred Geometries</h1>
            <p className="text-base text-gray-600 italic">Multi-layer spirograph mandala generator</p>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-lg flex justify-center items-center">
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={600} 
              className="rounded-lg shadow-md bg-black"
            />
          </div>
        </div>
        
        <div className="w-90 bg-white rounded-xl p-8 shadow-lg h-fit controls-scroll">
          <div className="mb-8">
            <h3 className="text-[#1a1a1a] mb-5 text-lg font-semibold">Sacred Presets</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button 
                className="py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 cursor-pointer text-xs font-medium transition-all duration-200 hover:border-purple-500 hover:bg-gray-100 active:bg-purple-500 active:text-white active:translate-y-0.5 text-center"
                onClick={() => applyPreset('mandala')}
              >
                Mandala
              </button>
              <button 
                className="py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 cursor-pointer text-xs font-medium transition-all duration-200 hover:border-purple-500 hover:bg-gray-100 active:bg-purple-500 active:text-white active:translate-y-0.5 text-center"
                onClick={() => applyPreset('flower')}
              >
                Flower
              </button>
              <button 
                className="py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 cursor-pointer text-xs font-medium transition-all duration-200 hover:border-purple-500 hover:bg-gray-100 active:bg-purple-500 active:text-white active:translate-y-0.5 text-center"
                onClick={() => applyPreset('galaxy')}
              >
                Galaxy
              </button>
              <button 
                className="py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 cursor-pointer text-xs font-medium transition-all duration-200 hover:border-purple-500 hover:bg-gray-100 active:bg-purple-500 active:text-white active:translate-y-0.5 text-center"
                onClick={() => applyPreset('chakra')}
              >
                Chakra
              </button>
              <button 
                className="py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 cursor-pointer text-xs font-medium transition-all duration-200 hover:border-purple-500 hover:bg-gray-100 active:bg-purple-500 active:text-white active:translate-y-0.5 text-center"
                onClick={() => applyPreset('accentLayer3')}
              >
                Accent Layer 3
              </button>
              <button 
                className="py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 cursor-pointer text-xs font-medium transition-all duration-200 hover:border-purple-500 hover:bg-gray-100 active:bg-purple-500 active:text-white active:translate-y-0.5 text-center"
                onClick={() => applyPreset('nautilus')}
              >
                Nautilus
              </button>
              <button 
                className="py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 cursor-pointer text-xs font-medium transition-all duration-200 hover:border-purple-500 hover:bg-gray-100 active:bg-purple-500 active:text-white active:translate-y-0.5 text-center"
                onClick={() => applyPreset('vortex')}
              >
                Vortex
              </button>
              <button 
                className="py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 cursor-pointer text-xs font-medium transition-all duration-200 hover:border-purple-500 hover:bg-gray-100 active:bg-purple-500 active:text-white active:translate-y-0.5 text-center"
                onClick={() => applyPreset('radiant')}
              >
                Radiant
              </button>
              <button 
                className="py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 cursor-pointer text-xs font-medium transition-all duration-200 hover:border-purple-500 hover:bg-gray-100 active:bg-purple-500 active:text-white active:translate-y-0.5 text-center"
                onClick={randomizeLayers}
              >
                Random Generate
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[#1a1a1a] mb-5 text-lg font-semibold">Pattern Layers</h3>
            
            {/* Layer 1 */}
            <div className={`border-2 border-gray-200 rounded-lg p-5 mb-4 transition-colors duration-200 ${layers[1].active ? 'border-purple-500 bg-purple-50' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-700 text-sm">Layer 1 (Primary)</span>
                <div 
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${layers[1].active ? 'bg-purple-500' : 'bg-gray-300'}`}
                  onClick={() => toggleLayer(1)}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-200 ${layers[1].active ? 'translate-x-6' : 'translate-x-0.5'} shadow-sm`}></div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-xs text-gray-600 font-medium">Outer Circle (R)</label>
                <input 
                  type="range" 
                  min="50" 
                  max="200" 
                  step="5" 
                  value={layers[1].R}
                  onChange={(e) => updateLayer(1, 'R', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-xs text-gray-600 font-medium">Inner Circle (r)</label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="2" 
                  value={layers[1].r}
                  onChange={(e) => updateLayer(1, 'r', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs text-gray-600 font-medium">Pen Distance (p)</label>
                <input 
                  type="range" 
                  min="5" 
                  max="80" 
                  step="2" 
                  value={layers[1].p}
                  onChange={(e) => updateLayer(1, 'p', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
                />
              </div>
            </div>

            {/* Layer 2 */}
            <div className={`border-2 border-gray-200 rounded-lg p-5 mb-4 transition-colors duration-200 ${layers[2].active ? 'border-purple-500 bg-purple-50' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-700 text-sm">Layer 2 (Secondary)</span>
                <div 
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${layers[2].active ? 'bg-purple-500' : 'bg-gray-300'}`}
                  onClick={() => toggleLayer(2)}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-200 ${layers[2].active ? 'translate-x-6' : 'translate-x-0.5'} shadow-sm`}></div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-xs text-gray-600 font-medium">Outer Circle (R)</label>
                <input 
                  type="range" 
                  min="50" 
                  max="200" 
                  step="5" 
                  value={layers[2].R}
                  onChange={(e) => updateLayer(2, 'R', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-xs text-gray-600 font-medium">Inner Circle (r)</label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="2" 
                  value={layers[2].r}
                  onChange={(e) => updateLayer(2, 'r', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs text-gray-600 font-medium">Pen Distance (p)</label>
                <input 
                  type="range" 
                  min="5" 
                  max="80" 
                  step="2" 
                  value={layers[2].p}
                  onChange={(e) => updateLayer(2, 'p', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
                />
              </div>
            </div>

            {/* Layer 3 */}
            <div className={`border-2 border-gray-200 rounded-lg p-5 mb-4 transition-colors duration-200 ${layers[3].active ? 'border-purple-500 bg-purple-50' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-700 text-sm">Layer 3 (Accent)</span>
                <div 
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${layers[3].active ? 'bg-purple-500' : 'bg-gray-300'}`}
                  onClick={() => toggleLayer(3)}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-200 ${layers[3].active ? 'translate-x-6' : 'translate-x-0.5'} shadow-sm`}></div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-xs text-gray-600 font-medium">Outer Circle (R)</label>
                <input 
                  type="range" 
                  min="50" 
                  max="200" 
                  step="5" 
                  value={layers[3].R}
                  onChange={(e) => updateLayer(3, 'R', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-xs text-gray-600 font-medium">Inner Circle (r)</label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="2" 
                  value={layers[3].r}
                  onChange={(e) => updateLayer(3, 'r', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs text-gray-600 font-medium">Pen Distance (p)</label>
                <input 
                  type="range" 
                  min="5" 
                  max="80" 
                  step="2" 
                  value={layers[3].p}
                  onChange={(e) => updateLayer(3, 'p', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[#1a1a1a] mb-5 text-lg font-semibold">Color Palette</h3>
            <div className="grid grid-cols-3 gap-3">
              <div 
                className={`w-full h-10 border-3 border-transparent rounded-lg cursor-pointer transition-all duration-200 hover:border-purple-500 hover:scale-105 ${currentPalette === 'white' ? 'border-purple-500 shadow-[0_0_0_2px_rgba(139,92,246,0.2)]' : ''}`}
                style={{ background: 'linear-gradient(135deg, #ffffff, #f8fafc)' }}
                onClick={() => setColorPalette('white')}
              ></div>
              <div 
                className={`w-full h-10 border-3 border-transparent rounded-lg cursor-pointer transition-all duration-200 hover:border-purple-500 hover:scale-105 ${currentPalette === 'sage' ? 'border-purple-500 shadow-[0_0_0_2px_rgba(139,92,246,0.2)]' : ''}`}
                style={{ background: 'linear-gradient(135deg, #9CA986, #B8C5A6)' }}
                onClick={() => setColorPalette('sage')}
              ></div>
              <div 
                className={`w-full h-10 border-3 border-transparent rounded-lg cursor-pointer transition-all duration-200 hover:border-purple-500 hover:scale-105 ${currentPalette === 'ocean' ? 'border-purple-500 shadow-[0_0_0_2px_rgba(139,92,246,0.2)]' : ''}`}
                style={{ background: 'linear-gradient(135deg, #4F9CF9, #7BB3F0)' }}
                onClick={() => setColorPalette('ocean')}
              ></div>
              <div 
                className={`w-full h-10 border-3 border-transparent rounded-lg cursor-pointer transition-all duration-200 hover:border-purple-500 hover:scale-105 ${currentPalette === 'warm' ? 'border-purple-500 shadow-[0_0_0_2px_rgba(139,92,246,0.2)]' : ''}`}
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
                onClick={() => setColorPalette('warm')}
              ></div>
              <div 
                className={`w-full h-10 border-3 border-transparent rounded-lg cursor-pointer transition-all duration-200 hover:border-purple-500 hover:scale-105 ${currentPalette === 'nature' ? 'border-purple-500 shadow-[0_0_0_2px_rgba(139,92,246,0.2)]' : ''}`}
                style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}
                onClick={() => setColorPalette('nature')}
              ></div>
              <div 
                className={`w-full h-10 border-3 border-transparent rounded-lg cursor-pointer transition-all duration-200 hover:border-purple-500 hover:scale-105 ${currentPalette === 'purple' ? 'border-purple-500 shadow-[0_0_0_2px_rgba(139,92,246,0.2)]' : ''}`}
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' }}
                onClick={() => setColorPalette('purple')}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[#1a1a1a] mb-5 text-lg font-semibold">Animation</h3>
            <div className="mb-4 flex items-center gap-3">
              <input
                type="checkbox"
                id="spiralMode"
                checked={spiralMode}
                onChange={() => setSpiralMode((v) => !v)}
                className="mr-2"
              />
              <label htmlFor="spiralMode" className="text-sm text-gray-700 font-medium select-none">
                Spiral Mode (true nautilus)
              </label>
            </div>
            {spiralMode && (
              <div className="mb-4">
                <label className="block mb-2 text-xs text-gray-600 font-medium">
                  Spiral Growth Rate
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={spiralGrowthRate}
                  onChange={e => setSpiralGrowthRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {spiralGrowthRate}
                </div>
              </div>
            )}
            <div className="mb-4">
              <label className="block mb-2 text-xs text-gray-600 font-medium">Drawing Speed</label>
              <input 
                type="range" 
                min="1" 
                max="1000" 
                step="1" 
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
              />
            </div>
            <div>
              <label className="block mb-2 text-xs text-gray-600 font-medium">Line Weight</label>
              <input 
                type="range" 
                min="0.2" 
                max="2" 
                step="0.1" 
                value={lineWidth}
                onChange={(e) => setLineWidth(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded bg-gray-200 outline-none border border-gray-300"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              className="flex-1 py-3.5 px-5 bg-purple-500 border-none rounded-lg text-white cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-purple-600 hover:-translate-y-0.5 hover:shadow-lg font-['Inter']"
              onClick={redrawSpirograph}
            >
              Generate
            </button>
              <button
              className="flex-1 py-3.5 px-5 bg-gray-100 text-gray-700 border-2 border-gray-200 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-gray-200 hover:border-gray-300 hover:shadow-md font-['Inter']"
              onClick={clearCanvas}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Custom slider styles */
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(139, 92, 246, 0.3);
          border: 2px solid white;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(139, 92, 246, 0.3);
        }

        /* Mobile responsive */
        @media (max-width: 1024px) {
          .container {
            flex-direction: column;
            gap: 32px;
          }

          .controls {
            width: 100%;
            order: 2;
          }

          .canvas-container {
            order: 1;
          }
        }

        @media (max-width: 768px) {
          .navigation {
            padding: 0 20px;
            height: 100px;
          }

          .nav-links {
            gap: 20px;
          }

          .nav-link {
            font-size: 14px;
          }

          .logo-main {
            font-size: 36px;
            line-height: 32px;
          }

          .logo-sub {
            font-size: 20px;
            line-height: 18px;
          }

          .container {
            margin-top: 120px;
            padding: 20px;
          }

          .canvas-title {
            font-size: 28px;
          }

          .canvas-wrapper {
            padding: 20px;
          }

          #spirographCanvas {
            width: 100%;
            max-width: 400px;
            height: auto;
          }

          .controls {
            padding: 24px;
          }

          .preset-buttons {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .action-buttons {
            flex-direction: column;
          }
        }

        .controls-scroll {
          max-height: 80vh;   /* or any height you want */
          overflow-y: auto;
        }
      `}</style>
    </>
  );
}