import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Download, Flower } from 'lucide-react';

const OrchidSpirograph = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Parameters for parametric orchid generation
  const [params, setParams] = useState({
    scale: 140,           // Overall size
    lineCount: 60,        // Number of ruled lines per petal
    speed: 0.01,          // Drawing speed
    lineWidth: 0.4,       // Line thickness
    color: '#333333',     // Line color
    petalCurvature: 1.2,  // How curved the petals are
    autoStop: true,
    completionThreshold: 1.0
  });

  // Define naturally curved orchid petal shapes with flowing rounded tips (fixed)
  const getTopSepalPoint = useCallback((u, v) => {
    // Top sepal - naturally rounded elliptical tip (longer and properly rounded)
    let width, y;
    
    if (v < 0.9) {
      // Main petal body - normal taper
      width = Math.sin(v * Math.PI) * 0.3;
      y = -v * params.scale * 1.2; // Make it longer and linear for main body
    } else {
      // Rounded tip section - use elliptical curve
      const tipProgress = (v - 0.9) / 0.1; // 0 to 1 in tip section
      const ellipseY = Math.sqrt(Math.max(0, 1 - tipProgress * tipProgress)); // Prevent invalid values
      width = Math.sin(0.9 * Math.PI) * 0.3 * ellipseY; // Shrink following curve
      y = -0.9 * params.scale * 1.2 - tipProgress * 20; // Continue flowing smoothly
    }
    
    const x = (u - 0.5) * width * params.scale;
    return { x, y };
  }, [params.scale]);

  const getLateralSepalPoint = useCallback((u, v, side) => {
    // Lateral sepals - flowing rounded tips (fix projecting lines)
    const direction = side === 0 ? -1 : 1;
    let width, x;
    
    if (v < 0.85) {
      // Main petal body
      width = Math.sin(v * Math.PI) * 0.8;
      x = direction * v * params.scale * 1.2; // Linear flow, not quadratic
    } else {
      // Rounded tip section
      const tipProgress = (v - 0.85) / 0.15;
      const ellipseCurve = Math.sqrt(Math.max(0, 1 - tipProgress * tipProgress)); // Prevent invalid values
      width = Math.sin(0.85 * Math.PI) * 0.8 * ellipseCurve;
      x = direction * (0.85 * params.scale * 1.2 + tipProgress * 25); // Smooth continuation
    }
    
    const y = (u - 0.5) * width * params.scale;
    return { x, y };
  }, [params.scale]);

  const getLateralPetalPoint = useCallback((u, v, side) => {
    // Inner lateral petals - naturally rounded tips (fixed projection bug)
    const angle = side === 0 ? -Math.PI/4 : Math.PI/4;
    let width, localY;
    
    if (v < 0.9) {
      // Main petal body - longer before tip
      width = Math.sin(v * Math.PI) * 0.5;
      localY = -v * 0.85; // Reduced extension to prevent projection
    } else {
      // Rounded tip - smaller and more controlled
      const tipProgress = (v - 0.9) / 0.1; // Shorter tip section
      const ellipseCurve = Math.sqrt(Math.max(0, 1 - tipProgress * tipProgress));
      width = Math.sin(0.9 * Math.PI) * 0.5 * ellipseCurve;
      localY = -0.9 * 0.85 - tipProgress * 8; // Much smaller tip extension
    }
    
    const localX = (u - 0.5) * width;
    
    // Rotate to proper angle
    const x = localX * Math.cos(angle) - localY * Math.sin(angle);
    const y = localX * Math.sin(angle) + localY * Math.cos(angle);
    
    return {
      x: x * params.scale,
      y: y * params.scale
    };
  }, [params.scale]);

  const getLabellumPoint = useCallback((u, v) => {
    // Labellum - flowing rounded lip
    let width, y;
    
    if (v < 0.85) {
      // Main lip body
      const naturalWave = 1 + Math.sin(v * Math.PI * 3) * 0.15;
      width = Math.sin(v * Math.PI) * 0.9 * naturalWave;
      y = v * params.scale * 0.8; // Linear flow for main body
    } else {
      // Rounded tip
      const tipProgress = (v - 0.85) / 0.15;
      const ellipseCurve = Math.sqrt(Math.max(0, 1 - tipProgress * tipProgress)); // Prevent invalid values
      width = Math.sin(0.85 * Math.PI) * 0.9 * ellipseCurve;
      y = 0.85 * params.scale * 0.8 + tipProgress * 25; // Smooth continuation
    }
    
    const x = (u - 0.5) * width * params.scale;
    return { x, y };
  }, [params.scale]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const drawOrchidPetal = useCallback((ctx, centerX, centerY, getPointFunc, progress, additionalParams = {}) => {
    const linesToDraw = Math.floor(progress * params.lineCount);
    
    ctx.strokeStyle = params.color;
    ctx.lineWidth = params.lineWidth;
    ctx.lineCap = 'round';
    
    for (let i = 0; i <= linesToDraw; i++) {
      const u = i / params.lineCount; // Position across petal
      
      ctx.beginPath();
      let firstPoint = true;
      
      // Draw curved line across the petal
      for (let j = 0; j <= 50; j++) {
        const v = j / 50; // Position along petal length
        const point = getPointFunc(u, v, ...Object.values(additionalParams));
        
        if (firstPoint) {
          ctx.moveTo(centerX + point.x, centerY + point.y);
          firstPoint = false;
        } else {
          ctx.lineTo(centerX + point.x, centerY + point.y);
        }
      }
      
      ctx.stroke();
    }
  }, [params]);

  const drawCompleteOrchid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    clearCanvas();
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw orchid in proper order (back to front)
    
    // 1. Top sepal (dorsal sepal)
    drawOrchidPetal(ctx, centerX, centerY, getTopSepalPoint, progress);
    
    // 2. Lateral sepals (the two side "background" petals)
    drawOrchidPetal(ctx, centerX, centerY, getLateralSepalPoint, progress, { side: 0 });
    drawOrchidPetal(ctx, centerX, centerY, getLateralSepalPoint, progress, { side: 1 });
    
    // 3. Lateral petals (the two inner side petals)
    drawOrchidPetal(ctx, centerX, centerY, getLateralPetalPoint, progress, { side: 0 });
    drawOrchidPetal(ctx, centerX, centerY, getLateralPetalPoint, progress, { side: 1 });
    
    // 4. Labellum (lip) - the distinctive bottom petal
    drawOrchidPetal(ctx, centerX, centerY, getLabellumPoint, progress);
    
  }, [progress, params, drawOrchidPetal, getTopSepalPoint, getLateralSepalPoint, getLateralPetalPoint, getLabellumPoint, clearCanvas]);

  const animate = useCallback(() => {
    if (!isDrawing) return;
    
    drawCompleteOrchid();
    
    let newProgress = progress + params.speed;
    
    if (params.autoStop && newProgress >= params.completionThreshold) {
      setIsDrawing(false);
      setProgress(params.completionThreshold);
      return;
    }
    
    if (newProgress >= 1) {
      setIsDrawing(false);
      setProgress(1);
    } else {
      setProgress(newProgress);
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isDrawing, progress, params.speed, params.autoStop, params.completionThreshold, drawCompleteOrchid]);

  useEffect(() => {
    if (isDrawing) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDrawing, animate]);

  const startDrawing = () => {
    setProgress(0);
    clearCanvas();
    setIsDrawing(true);
  };

  const pauseDrawing = () => {
    setIsDrawing(false);
  };

  const resetCanvas = () => {
    setIsDrawing(false);
    setProgress(0);
    clearCanvas();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'wireframe-orchid.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const presetOrchids = [
    { name: 'Classic Orchid', scale: 140, lineCount: 60, speed: 0.01, lineWidth: 0.4, color: '#333333', petalCurvature: 1.2 },
    { name: 'Lotus (Pointed)', scale: 140, lineCount: 60, speed: 0.01, lineWidth: 0.4, color: '#333333', petalCurvature: 1.2 },
    { name: 'Large Orchid', scale: 180, lineCount: 80, speed: 0.008, lineWidth: 0.3, color: '#444444', petalCurvature: 1.0 },
    { name: 'Delicate Orchid', scale: 120, lineCount: 40, speed: 0.012, lineWidth: 0.5, color: '#555555', petalCurvature: 1.4 },
    { name: 'Fine Detail', scale: 160, lineCount: 100, speed: 0.006, lineWidth: 0.2, color: '#666666', petalCurvature: 1.3 },
    { name: 'Bold Lines', scale: 150, lineCount: 30, speed: 0.015, lineWidth: 0.6, color: '#222222', petalCurvature: 1.1 }
  ];

  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  // Redraw when parameters change
  useEffect(() => {
    if (!isDrawing) {
      drawCompleteOrchid();
    }
  }, [params, drawCompleteOrchid, isDrawing]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Parametric Orchid Generator
          </h1>
          <p className="text-gray-600">Create wireframe orchids with rounded petals using ruled surface technique</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-4 border border-gray-300 shadow-lg">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full border border-gray-300 rounded-lg bg-white"
              />
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Drawing Progress</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={isDrawing ? pauseDrawing : startDrawing}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  {isDrawing ? <Pause size={20} /> : <Play size={20} />}
                  {isDrawing ? 'Pause' : 'Draw'}
                </button>
                <button
                  onClick={resetCanvas}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <RotateCcw size={20} />
                  Clear
                </button>
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download size={20} />
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Orchid Presets */}
            <div className="bg-white rounded-xl p-4 border border-gray-300 shadow">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Flower className="text-pink-500" size={20} />
                Orchid Presets
              </h3>
              <div className="space-y-2">
                {presetOrchids.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setParams({ ...params, ...preset })}
                    className="w-full px-3 py-2 text-left bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Controls */}
            <div className="bg-white rounded-xl p-4 border border-gray-300 shadow">
              <h3 className="text-lg font-semibold mb-3">Parameters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Scale</label>
                  <input
                    type="range"
                    min="100"
                    max="300"
                    value={params.scale}
                    onChange={(e) => setParams({...params, scale: parseInt(e.target.value)})}
                    className="w-full accent-purple-500"
                  />
                  <span className="text-xs text-gray-500">{params.scale}</span>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Line Count</label>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={params.lineCount}
                    onChange={(e) => setParams({...params, lineCount: parseInt(e.target.value)})}
                    className="w-full accent-purple-500"
                  />
                  <span className="text-xs text-gray-500">{params.lineCount}</span>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Line Width</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={params.lineWidth}
                    onChange={(e) => setParams({...params, lineWidth: parseFloat(e.target.value)})}
                    className="w-full accent-purple-500"
                  />
                  <span className="text-xs text-gray-500">{params.lineWidth}</span>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Petal Curvature</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={params.petalCurvature}
                    onChange={(e) => setParams({...params, petalCurvature: parseFloat(e.target.value)})}
                    className="w-full accent-purple-500"
                  />
                  <span className="text-xs text-gray-500">{params.petalCurvature}</span>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Speed</label>
                  <input
                    type="range"
                    min="0.002"
                    max="0.02"
                    step="0.001"
                    value={params.speed}
                    onChange={(e) => setParams({...params, speed: parseFloat(e.target.value)})}
                    className="w-full accent-purple-500"
                  />
                  <span className="text-xs text-gray-500">{params.speed}</span>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Color</label>
                  <input
                    type="color"
                    value={params.color}
                    onChange={(e) => setParams({...params, color: e.target.value})}
                    className="w-full h-10 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrchidSpirograph;