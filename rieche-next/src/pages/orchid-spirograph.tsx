import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const OrchidSpirograph = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPalette, setCurrentPalette] = useState('orchid');
  const [animationId, setAnimationId] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [petals, setPetals] = useState({
    1: { active: true },
    2: { active: true },
    3: { active: true }
  });

  const palettes = useMemo(() => ({
    orchid: ['#f472b6', '#ec4899', '#db2777', '#be185d'],
    sunset: ['#fb7185', '#f59e0b', '#f97316', '#ea580c'],
    lavender: ['#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9'],
    coral: ['#fda4af', '#fb7185', '#e11d48', '#be123c'],
    sage: ['#86efac', '#4ade80', '#22c55e', '#16a34a'],
    soft: ['#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b']
  }), []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (animationId) {
      cancelAnimationFrame(animationId);
      setIsDrawing(false);
    }
  }, [animationId]);

  const drawUpperPetals = useCallback((ctx: CanvasRenderingContext2D, t: number, width: number, length: number, curveIntensity: number, symmetry: number, centerX: number, centerY: number) => {
    // Draw 3 upper petals - much larger and more visible
    for (let i = 0; i < 3; i++) {
      const baseAngle = (Math.PI * 2 * i) / 3 - Math.PI / 2; // Start from top
      
      // Create large, flowing petal shapes
      const petalCurve = Math.sin(3 * t) * curveIntensity * 0.3;
      const r = width * (1 + 0.5 * Math.sin(4 * t + baseAngle) + petalCurve);
      
      const x = centerX + r * Math.cos(t + baseAngle) * symmetry;
      const y = centerY + r * Math.sin(t + baseAngle) - length * 0.5;

      if (t > 0.02) { // Much smaller threshold for smoother start
        const smallStep = Math.max(0.01, t * 0.02); // Dynamic step size
        const prevCurve = Math.sin(3 * (t - smallStep)) * curveIntensity * 0.3;
        const prevR = width * (1 + 0.5 * Math.sin(4 * (t - smallStep) + baseAngle) + prevCurve);
        const prevX = centerX + prevR * Math.cos((t - smallStep) + baseAngle) * symmetry;
        const prevY = centerY + prevR * Math.sin((t - smallStep) + baseAngle) - length * 0.5;
        
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.shadowBlur = 0; // Clear shadow
      }
    }
  }, []);

  const drawLowerPetals = useCallback((ctx: CanvasRenderingContext2D, t: number, width: number, length: number, curveIntensity: number, symmetry: number, centerX: number, centerY: number) => {
    // Draw 2 lower lateral petals - bold and prominent
    for (let i = 0; i < 2; i++) {
      const baseAngle = Math.PI * 0.4 + i * Math.PI * 0.4; // Side angles
      
      // Large lateral petal shapes
      const petalCurve = Math.cos(2 * t) * curveIntensity * 0.4;
      const r = width * (1.2 + 0.6 * Math.sin(3 * t + baseAngle) + petalCurve);
      
      const x = centerX + r * Math.cos(t + baseAngle) * symmetry;
      const y = centerY + r * Math.sin(t + baseAngle) + length * 0.3;

      if (t > 0.02) { // Much smaller threshold
        const smallStep = Math.max(0.01, t * 0.02);
        const prevCurve = Math.cos(2 * (t - smallStep)) * curveIntensity * 0.4;
        const prevR = width * (1.2 + 0.6 * Math.sin(3 * (t - smallStep) + baseAngle) + prevCurve);
        const prevX = centerX + prevR * Math.cos((t - smallStep) + baseAngle) * symmetry;
        const prevY = centerY + prevR * Math.sin((t - smallStep) + baseAngle) + length * 0.3;
        
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.shadowBlur = 0; // Clear shadow
      }
    }
  }, []);

  const drawLabellum = useCallback((ctx: CanvasRenderingContext2D, t: number, width: number, length: number, curveIntensity: number, symmetry: number, centerX: number, centerY: number) => {
    // Draw the large, dramatic orchid lip at the bottom
    const baseAngle = Math.PI / 2; // Bottom position
    
    // Create a large, ruffled labellum
    const ruffles = Math.sin(curveIntensity * 6 * t) * 0.3;
    const r = width * (1.5 + 0.8 * Math.sin(2 * t) + ruffles);
    
    const x = centerX + r * Math.cos(t + baseAngle) * symmetry;
    const y = centerY + r * Math.sin(t + baseAngle) + length * 0.6;

    // Draw main labellum curve
    if (t > 0.02) { // Much smaller threshold
      const smallStep = Math.max(0.01, t * 0.02);
      const prevRuffles = Math.sin(curveIntensity * 6 * (t - smallStep)) * 0.3;
      const prevR = width * (1.5 + 0.8 * Math.sin(2 * (t - smallStep)) + prevRuffles);
      const prevX = centerX + prevR * Math.cos((t - smallStep) + baseAngle) * symmetry;
      const prevY = centerY + prevR * Math.sin((t - smallStep) + baseAngle) + length * 0.6;
      
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.shadowBlur = 0; // Clear shadow
    }

    // Add central column/stem
    if (t < Math.PI) {
      const columnX = centerX + 10 * Math.sin(t * 2) * symmetry;
      const columnY = centerY + t * 8;
      
      if (t > 0.02) {
        const smallStep = Math.max(0.01, t * 0.02);
        const prevColumnX = centerX + 10 * Math.sin((t - smallStep) * 2) * symmetry;
        const prevColumnY = centerY + (t - smallStep) * 8;
        
        ctx.beginPath();
        ctx.moveTo(prevColumnX, prevColumnY);
        ctx.lineTo(columnX, columnY);
        ctx.stroke();
        ctx.shadowBlur = 0; // Clear shadow
      }
    }
  }, []);

  const drawOrchidPetal = useCallback((petalType: number, width: number, length: number, curveIntensity: number, color: string, opacity: number = 0.8) => {
    return new Promise<void>((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve();
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve();
        return;
      }

      const speedElement = document.getElementById('speed') as HTMLInputElement;
      const lineWidthElement = document.getElementById('lineWidth') as HTMLInputElement;
      const symmetryElement = document.getElementById('symmetry') as HTMLInputElement;
      
      const speed = parseFloat(speedElement?.value || '50');
      const lineWidth = parseFloat(lineWidthElement?.value || '2.0');
      const symmetry = parseFloat(symmetryElement?.value || '1.0');
      
      let t = 0;
      const maxT = Math.PI * 2;
      const increment = Math.max(0.01, speed * 0.008); // Much smaller increment for smooth lines
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      function animate() {
        if (t > maxT) {
          resolve();
          return;
        }

        if (!ctx) return;

        ctx.globalAlpha = opacity;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 2;
        ctx.shadowColor = color;

        if (petalType === 1) { // Upper petals
          drawUpperPetals(ctx, t, width, length, curveIntensity, symmetry, centerX, centerY);
        } else if (petalType === 2) { // Lower petals
          drawLowerPetals(ctx, t, width, length, curveIntensity, symmetry, centerX, centerY);
        } else if (petalType === 3) { // Labellum
          drawLabellum(ctx, t, width, length, curveIntensity, symmetry, centerX, centerY);
        }

        t += increment;
        const newAnimationId = requestAnimationFrame(animate);
        setAnimationId(newAnimationId);
      }

      animate();
    });
  }, [drawUpperPetals, drawLowerPetals, drawLabellum]);

  const bloomOrchid = useCallback(async () => {
    if (isDrawing) return;
    
    clearCanvas();
    setIsDrawing(true);

    const promises: Promise<void>[] = [];
    
    // Draw each active petal type
    for (let i = 1; i <= 3; i++) {
      if (petals[i as 1 | 2 | 3].active) {
        const widthElement = document.getElementById(`width${i}`) as HTMLInputElement;
        const lengthElement = document.getElementById(`length${i}`) as HTMLInputElement;
        const curveElement = document.getElementById(`curve${i}`) as HTMLInputElement;
        
        const width = parseFloat(widthElement?.value || '90');
        const length = parseFloat(lengthElement?.value || '70');
        const curve = parseFloat(curveElement?.value || '1.2');
        const color = palettes[currentPalette as keyof typeof palettes][i - 1] || palettes[currentPalette as keyof typeof palettes][0];
        const opacity = i === 3 ? 0.9 : 0.7; // Labellum more prominent
        
        promises.push(drawOrchidPetal(i, width, length, curve, color, opacity));
      }
    }

    await Promise.all(promises);
    setIsDrawing(false);
  }, [isDrawing, petals, currentPalette, palettes, clearCanvas, drawOrchidPetal]);

  const togglePetal = useCallback((petalNum: number) => {
    setPetals(prev => ({
      ...prev,
      [petalNum as 1 | 2 | 3]: { active: !prev[petalNum as 1 | 2 | 3].active }
    }));
  }, []);

  const setColorPalette = useCallback((palette: string) => {
    setCurrentPalette(palette);
  }, []);

  const applyPreset = useCallback((preset: string) => {
    const presets: Record<string, {
      petals: { 1: { active: boolean }; 2: { active: boolean }; 3: { active: boolean } };
      width1: number;
      length1: number;
      curve1: number;
      width2: number;
      length2: number;
      curve2: number;
      width3: number;
      length3: number;
      curve3: number;
    }> = {
      cattleya: {
        petals: { 1: { active: true }, 2: { active: true }, 3: { active: true } },
        width1: 95, length1: 75, curve1: 1.2,
        width2: 85, length2: 70, curve2: 1.4,
        width3: 105, length3: 85, curve3: 2.0
      },
      phalaenopsis: {
        petals: { 1: { active: true }, 2: { active: true }, 3: { active: true } },
        width1: 90, length1: 70, curve1: 1.0,
        width2: 80, length2: 65, curve2: 1.2,
        width3: 100, length3: 80, curve3: 1.8
      },
      dendrobium: {
        petals: { 1: { active: true }, 2: { active: true }, 3: { active: true } },
        width1: 85, length1: 90, curve1: 1.5,
        width2: 75, length2: 80, curve2: 1.6,
        width3: 95, length3: 70, curve3: 2.2
      },
      vanilla: {
        petals: { 1: { active: true }, 2: { active: true }, 3: { active: true } },
        width1: 80, length1: 100, curve1: 0.9,
        width2: 70, length2: 95, curve2: 1.1,
        width3: 110, length3: 60, curve3: 1.5
      }
    };
    
    const config = presets[preset];
    if (!config) return;
    
    // Apply petal settings
    setPetals(config.petals as { 1: { active: boolean }; 2: { active: boolean }; 3: { active: boolean } });
    
    // Set values
    for (let i = 1; i <= 3; i++) {
      const widthElement = document.getElementById(`width${i}`) as HTMLInputElement;
      const lengthElement = document.getElementById(`length${i}`) as HTMLInputElement;
      const curveElement = document.getElementById(`curve${i}`) as HTMLInputElement;
      
      if (widthElement) widthElement.value = config[`width${i}` as keyof typeof config].toString();
      if (lengthElement) lengthElement.value = config[`length${i}` as keyof typeof config].toString();
      if (curveElement) curveElement.value = config[`curve${i}` as keyof typeof config].toString();
    }
    
    setTimeout(bloomOrchid, 100);
  }, [bloomOrchid]);

  const redrawOrchid = useCallback(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    setIsDrawing(false);
    setTimeout(bloomOrchid, 100);
  }, [animationId, bloomOrchid]);

  useEffect(() => {
    // Event listeners
    for (let i = 1; i <= 3; i++) {
      const widthElement = document.getElementById(`width${i}`);
      const lengthElement = document.getElementById(`length${i}`);
      const curveElement = document.getElementById(`curve${i}`);
      
      widthElement?.addEventListener('input', redrawOrchid);
      lengthElement?.addEventListener('input', redrawOrchid);
      curveElement?.addEventListener('input', redrawOrchid);
    }

    // Initial bloom
    setTimeout(bloomOrchid, 500);

    return () => {
      // Cleanup event listeners
      for (let i = 1; i <= 3; i++) {
        const widthElement = document.getElementById(`width${i}`);
        const lengthElement = document.getElementById(`length${i}`);
        const curveElement = document.getElementById(`curve${i}`);
        
        widthElement?.removeEventListener('input', redrawOrchid);
        lengthElement?.removeEventListener('input', redrawOrchid);
        curveElement?.removeEventListener('input', redrawOrchid);
      }
    };
  }, [bloomOrchid, redrawOrchid]);

  return (
    <>
      <Head>
    <title>Sacred Orchid | RIECHE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style jsx global>{`
        /* The Seasons Font */
        @font-face {
            font-family: 'The Seasons';
            src: url('/public/assets/fonts/theseasons-reg.57d3e9b5285fa8dfd595ef780.57981c5d6c03cd30856912da5d26c788-webfont.woff2') format('woff2'),
                 url('/public/assets/fonts/theseasons-reg.57d3e9b5285fa8dfd595ef780.57981c5d6c03cd30856912da5d26c788-webfont.woff') format('woff'),
                 url('/public/assets/fonts/theseasons-reg.57d3e9b5285fa8dfd595ef780.57981c5d6c03cd30856912da5d26c788.otf') format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
            font-family: 'Inter', sans-serif;
            color: #1a1a1a;
            min-height: 100vh;
        }

        /* Navigation */
        .navigation {
            width: 100%;
            height: 120px;
            background: rgba(248, 250, 252, 0.95);
            padding: 0 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: fixed;
            top: 0;
            z-index: 100;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .logo {
            display: flex;
            flex-direction: column;
        }

        .logo-main {
            font-family: 'The Seasons', serif;
            font-size: 48px;
            font-weight: 400;
            line-height: 43px;
            color: #374151;
        }

        .logo-sub {
            font-family: 'The Seasons', serif;
            font-size: 28px;
            font-weight: 400;
            line-height: 25px;
            color: #6b7280;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 32px;
        }

        .nav-link {
            font-size: 16px;
            font-weight: 500;
            color: #374151;
            text-decoration: none;
            transition: opacity 0.3s ease;
        }

        .nav-link:hover {
            opacity: 0.7;
        }

        .contact-button {
            padding: 12px 20px;
            background: #8b5cf6;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0px 1px 2px rgba(139, 92, 246, 0.2);
        }

        .contact-button:hover {
            background: #7c3aed;
            transform: translateY(-1px);
        }

        .container {
            display: flex;
            max-width: 1400px;
            margin: 140px auto 40px;
            padding: 40px 20px;
            gap: 40px;
        }

        .canvas-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .canvas-header {
            text-align: center;
            margin-bottom: 32px;
        }

        .canvas-title {
            font-family: 'The Seasons', serif;
            font-size: 36px;
            font-weight: 400;
            color: #374151;
            margin-bottom: 8px;
        }

        .canvas-subtitle {
            font-size: 16px;
            color: #6b7280;
            font-style: italic;
        }

        .canvas-wrapper {
            background: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        #orchidCanvas {
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            background: linear-gradient(135deg, #fefefe 0%, #f9fafb 100%);
        }

        .controls {
            width: 360px;
            background: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            height: fit-content;
        }

        .control-group {
            margin-bottom: 32px;
        }

        .control-group:last-child {
            margin-bottom: 0;
        }

        .control-group h3 {
            color: #374151;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: 600;
        }

        .petal-controls {
            border: 2px solid #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 16px;
            transition: border-color 0.2s ease;
        }

        .petal-controls.active {
            border-color: #db2777;
            background: #fdf2f8;
        }

        .petal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .petal-title {
            font-weight: 600;
            color: #374151;
            font-size: 14px;
        }

        .petal-toggle {
            width: 50px;
            height: 24px;
            background: #e5e7eb;
            border-radius: 12px;
            position: relative;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .petal-toggle.active {
            background: #db2777;
        }

        .petal-toggle::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            top: 2px;
            left: 2px;
            transition: transform 0.2s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .petal-toggle.active::after {
            transform: translateX(26px);
        }

        .slider-container {
            margin-bottom: 16px;
        }

        .slider-container:last-child {
            margin-bottom: 0;
        }

        .slider-container label {
            display: block;
            margin-bottom: 8px;
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }

        input[type="range"] {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #f3f4f6;
            outline: none;
            -webkit-appearance: none;
            border: 1px solid #e5e7eb;
        }

        input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #db2777;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(219, 39, 119, 0.3);
            border: 2px solid white;
        }

        input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #db2777;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(219, 39, 119, 0.3);
        }

        .preset-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
        }

        .preset-btn {
            padding: 12px 16px;
            background: #fdf2f8;
            border: 2px solid #f3e8ff;
            border-radius: 8px;
            color: #374151;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s ease;
            text-align: center;
        }

        .preset-btn:hover {
            border-color: #db2777;
            background: #fce7f3;
        }

        .preset-btn:active {
            background: #db2777;
            color: white;
            transform: translateY(1px);
        }

        .color-palette {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }

        .color-btn {
            width: 100%;
            height: 40px;
            border: 3px solid transparent;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }

        .color-btn:hover {
            border-color: #db2777;
            transform: scale(1.05);
        }

        .color-btn.active {
            border-color: #db2777;
            box-shadow: 0 0 0 2px rgba(219, 39, 119, 0.2);
        }

        .orchid { background: linear-gradient(135deg, #f472b6, #ec4899, #db2777); }
        .sunset { background: linear-gradient(135deg, #fb7185, #f59e0b, #f97316); }
        .lavender { background: linear-gradient(135deg, #a78bfa, #8b5cf6, #7c3aed); }
        .coral { background: linear-gradient(135deg, #fda4af, #fb7185, #e11d48); }
        .sage { background: linear-gradient(135deg, #86efac, #4ade80, #22c55e); }
        .soft { background: linear-gradient(135deg, #e2e8f0, #cbd5e1, #94a3b8); }

        .action-buttons {
            display: flex;
            gap: 12px;
            margin-top: 24px;
        }

        .action-btn {
            flex: 1;
            padding: 14px 20px;
            background: #db2777;
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            font-family: 'Inter', sans-serif;
        }

        .action-btn:hover {
            background: #be185d;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
        }

        .action-btn:active {
            transform: translateY(0);
        }

        .action-btn.secondary {
            background: #f3f4f6;
            color: #374151;
            border: 2px solid #e5e7eb;
        }

        .action-btn.secondary:hover {
            background: #e5e7eb;
            border-color: #d1d5db;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Mobile Responsive */
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

            #orchidCanvas {
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
        `}</style>
      </Head>

      {/* Navigation */}
      <nav className="navigation">
        <div className="logo">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="logo-main">RIECHE</div>
            <div className="logo-sub">Pilates Studio</div>
          </Link>
        </div>
        <div className="nav-links">
          <Link href="/philosophy" className="nav-link">Rieche Philosophy</Link>
          <Link href="/quiz" className="nav-link">Quiz</Link>
          <Link href="/building-rieche" className="nav-link">Building RIECHE</Link>
          <Link href="/the-room" className="nav-link">The Room</Link>
          <Link href="#contact" className="contact-button">Contact us</Link>
        </div>
    </nav>
    
      <div className="container">
        <div className="canvas-container">
          <div className="canvas-header">
            <h1 className="canvas-title">Sacred Orchid</h1>
            <p className="canvas-subtitle">Botanical spirograph generator</p>
            </div>
            
          <div className="canvas-wrapper">
            <canvas id="orchidCanvas" ref={canvasRef} width={600} height={600} />
            </div>
        </div>
        
        <div className="controls">
          <div className="control-group">
                <h3>Orchid Presets</h3>
            <div className="preset-buttons">
              <button className="preset-btn" onClick={() => applyPreset('cattleya')}>Cattleya</button>
              <button className="preset-btn" onClick={() => applyPreset('phalaenopsis')}>Moth Orchid</button>
              <button className="preset-btn" onClick={() => applyPreset('dendrobium')}>Dendrobium</button>
              <button className="preset-btn" onClick={() => applyPreset('vanilla')}>Vanilla</button>
                </div>
            </div>

          <div className="control-group">
                <h3>Petal Layers</h3>
                
            {/* Upper Petals */}
            <div className={`petal-controls ${petals[1].active ? 'active' : ''}`} id="petal1">
              <div className="petal-header">
                <span className="petal-title">Upper Petals</span>
                <div className={`petal-toggle ${petals[1].active ? 'active' : ''}`} onClick={() => togglePetal(1)} />
                    </div>
              <div className="slider-container">
                        <label>Petal Width</label>
                <input type="range" id="width1" min="30" max="120" step="5" defaultValue="90" />
                    </div>
              <div className="slider-container">
                        <label>Petal Length</label>
                <input type="range" id="length1" min="20" max="100" step="5" defaultValue="70" />
                    </div>
              <div className="slider-container">
                        <label>Curve Intensity</label>
                <input type="range" id="curve1" min="0.1" max="2" step="0.1" defaultValue="1.2" />
                    </div>
                </div>

            {/* Lower Petals */}
            <div className={`petal-controls ${petals[2].active ? 'active' : ''}`} id="petal2">
              <div className="petal-header">
                <span className="petal-title">Lower Petals</span>
                <div className={`petal-toggle ${petals[2].active ? 'active' : ''}`} onClick={() => togglePetal(2)} />
                    </div>
              <div className="slider-container">
                        <label>Petal Width</label>
                <input type="range" id="width2" min="30" max="120" step="5" defaultValue="85" />
                    </div>
              <div className="slider-container">
                        <label>Petal Length</label>
                <input type="range" id="length2" min="20" max="100" step="5" defaultValue="70" />
                    </div>
              <div className="slider-container">
                        <label>Curve Intensity</label>
                <input type="range" id="curve2" min="0.1" max="2" step="0.1" defaultValue="1.4" />
                    </div>
                </div>

            {/* Labellum (Lip) */}
            <div className={`petal-controls ${petals[3].active ? 'active' : ''}`} id="petal3">
              <div className="petal-header">
                <span className="petal-title">Labellum (Lip)</span>
                <div className={`petal-toggle ${petals[3].active ? 'active' : ''}`} onClick={() => togglePetal(3)} />
                    </div>
              <div className="slider-container">
                        <label>Lip Width</label>
                <input type="range" id="width3" min="40" max="140" step="5" defaultValue="100" />
                    </div>
              <div className="slider-container">
                        <label>Lip Extension</label>
                <input type="range" id="length3" min="30" max="120" step="5" defaultValue="80" />
                    </div>
              <div className="slider-container">
                        <label>Ruffle Detail</label>
                <input type="range" id="curve3" min="0.2" max="3" step="0.1" defaultValue="2.0" />
                    </div>
                </div>
            </div>

          <div className="control-group">
                <h3>Color Palette</h3>
            <div className="color-palette">
              <div className={`color-btn orchid ${currentPalette === 'orchid' ? 'active' : ''}`} onClick={() => setColorPalette('orchid')} />
              <div className={`color-btn sunset ${currentPalette === 'sunset' ? 'active' : ''}`} onClick={() => setColorPalette('sunset')} />
              <div className={`color-btn lavender ${currentPalette === 'lavender' ? 'active' : ''}`} onClick={() => setColorPalette('lavender')} />
              <div className={`color-btn coral ${currentPalette === 'coral' ? 'active' : ''}`} onClick={() => setColorPalette('coral')} />
              <div className={`color-btn sage ${currentPalette === 'sage' ? 'active' : ''}`} onClick={() => setColorPalette('sage')} />
              <div className={`color-btn soft ${currentPalette === 'soft' ? 'active' : ''}`} onClick={() => setColorPalette('soft')} />
                </div>
            </div>

          <div className="control-group">
                <h3>Bloom Details</h3>
            <div className="slider-container">
                    <label>Drawing Speed</label>
              <input type="range" id="speed" min="10" max="100" step="5" defaultValue="50" />
                </div>
            <div className="slider-container">
                    <label>Line Delicacy</label>
              <input type="range" id="lineWidth" min="1" max="4" step="0.2" defaultValue="2.0" />
                </div>
            <div className="slider-container">
                    <label>Symmetry</label>
              <input type="range" id="symmetry" min="0.7" max="1.3" step="0.05" defaultValue="1.0" />
                </div>
            </div>

          <div className="action-buttons">
            <button className="action-btn" onClick={bloomOrchid}>Bloom</button>
            <button className="action-btn secondary" onClick={clearCanvas}>Clear</button>
            </div>
        </div>
    </div>
    </>
  );
};

export default OrchidSpirograph; 