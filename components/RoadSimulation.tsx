
import React, { useEffect, useRef } from 'react';
import { RoadType } from '../types';

interface RoadSimulationProps {
  speed: number;
  distance: number;
  roadType: RoadType;
  isPaused: boolean;
}

const RoadSimulation: React.FC<RoadSimulationProps> = ({ speed, distance, roadType, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef(0);

  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string, isUser: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Dynamic Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(-32, -42, 64, 98, 16);
    ctx.fill();

    // Car Body - Metallic Finish
    const bodyGrad = ctx.createLinearGradient(-25, -50, 25, 30);
    bodyGrad.addColorStop(0, color);
    bodyGrad.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-25, -50, 50, 80, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Windshield - Cyan Tint
    ctx.fillStyle = 'rgba(100, 220, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(-20, -38, 40, 22, 5);
    ctx.fill();
    
    // Glass Reflection
    const lightGrad = ctx.createLinearGradient(-20, -38, 20, -16);
    lightGrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    lightGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
    ctx.fillStyle = lightGrad;
    ctx.fill();

    // Roof Details
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect(-16, -10, 32, 32, 4);
    ctx.fill();

    // Lights
    if (isUser) {
        // High-Output LED Headlights (White)
        ctx.fillStyle = '#f8fafc';
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'white';
        ctx.fillRect(-23, -49, 14, 7);
        ctx.fillRect(9, -49, 14, 7);
        ctx.shadowBlur = 0;
    } else {
        // Brake & Signal Lights (Red/Orange)
        const isBraking = distance < 40;
        ctx.fillStyle = isBraking ? '#ef4444' : '#991b1b';
        ctx.shadowBlur = isBraking ? 40 : 10;
        ctx.shadowColor = '#ef4444';
        ctx.fillRect(-22, 26, 14, 8);
        ctx.fillRect(8, 26, 14, 8);
        ctx.shadowBlur = 0;
    }

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      if (!isPaused) {
        offsetRef.current += (speed / 3.6) * 1.5; // Animated speed factor
      }

      const width = canvas.width = canvas.offsetWidth;
      const height = canvas.height = canvas.offsetHeight;
      const horizon = height * 0.28;

      // SKY / VOID
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // ENVIRONMENT & ROADSIDE
      if (roadType === 'highway') {
        // High-contrast green verges
        ctx.fillStyle = '#052e16';
        ctx.fillRect(0, horizon, width, height - horizon);
        
        // Distant Terrain Silhouettes
        ctx.fillStyle = '#064e3b';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(i * width/3 - 150, horizon);
          ctx.quadraticCurveTo(i * width/3 + 250, horizon - 60, i * width/3 + 600, horizon);
          ctx.fill();
        }
      } else {
        // Urban environment with sidewalk textures
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, horizon, width, height - horizon);
        
        // City Skyline with neon highlights
        ctx.fillStyle = '#020617';
        for(let j=0; j<20; j++) {
            const bx = j * (width / 16);
            const bh = 40 + Math.sin(j * 1.8) * 35;
            ctx.fillRect(bx, horizon - bh, width / 18, bh);
            // Neon strips on buildings
            if (j % 3 === 0) {
              ctx.fillStyle = '#3b82f6';
              ctx.fillRect(bx + 2, horizon - bh + 10, 2, bh - 10);
              ctx.fillStyle = '#020617';
            }
        }
      }

      // ROAD GEOMETRY
      const roadWidthBottom = roadType === 'highway' ? width * 0.96 : width * 0.84;
      const roadWidthTop = roadType === 'highway' ? width * 0.18 : width * 0.14;

      ctx.beginPath();
      ctx.moveTo((width - roadWidthTop) / 2, horizon);
      ctx.lineTo((width + roadWidthTop) / 2, horizon);
      ctx.lineTo((width + roadWidthBottom) / 2, height);
      ctx.lineTo((width - roadWidthBottom) / 2, height);
      ctx.closePath();
      ctx.fillStyle = '#111827';
      ctx.fill();
      
      // Road Shoulders / Concrete Barrier Lines
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.stroke();

      // DYNAMIC LANE MARKINGS (Motion effect)
      const segments = 22;
      for (let i = 0; i < segments; i++) {
        const progress = ((offsetRef.current / 120 + i / segments) % 1);
        const y = horizon + progress * (height - horizon);
        const pScale = progress;
        const currentRoadWidth = roadWidthTop + (roadWidthBottom - roadWidthTop) * progress;
        
        if (roadType === 'highway') {
          // Sharp neon-white lane dividers
          ctx.strokeStyle = '#f8fafc';
          ctx.setLineDash([]);
          ctx.lineWidth = 2 + 14 * pScale;
          ctx.beginPath();
          ctx.moveTo(width / 2, y);
          ctx.lineTo(width / 2, y + 60 * pScale + 20);
          ctx.stroke();

          // Reflective roadside markers (Yellow/Green)
          if (i % 5 === 0) {
              ctx.fillStyle = '#22c55e';
              ctx.beginPath();
              ctx.arc(width / 2 - currentRoadWidth / 2 - 40 * pScale - 15, y, 6 * pScale + 3, 0, Math.PI * 2);
              ctx.arc(width / 2 + currentRoadWidth / 2 + 40 * pScale + 15, y, 6 * pScale + 3, 0, Math.PI * 2);
              ctx.fill();
          }
        } else {
          // Urban pedestrian crossings and markings
          if (i % 7 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(width / 2 - currentRoadWidth / 2, y, currentRoadWidth, 35 * pScale + 12);
          }
          // Vivid yellow curbs
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 3 + 8 * pScale;
          ctx.beginPath();
          ctx.moveTo(width / 2 - currentRoadWidth / 2 + 6, y);
          ctx.lineTo(width / 2 - currentRoadWidth / 2 + 6, y + 15);
          ctx.moveTo(width / 2 + currentRoadWidth / 2 - 6, y);
          ctx.lineTo(width / 2 + currentRoadWidth / 2 - 6, y + 15);
          ctx.stroke();
        }
      }

      // TRAFFIC: Lead Car (Moving one by one ahead)
      const relDist = Math.max(0.01, Math.min(1, distance / 200));
      const leadCarY = height - (height - horizon) * (1 - relDist);
      const leadCarScale = 0.3 + (2.0 * (1 - relDist));
      drawCar(ctx, width / 2, leadCarY, leadCarScale, '#991b1b', false);

      // TRAFFIC: User Car (Player perspective)
      const userCarY = height - 150;
      const userCarScale = 2.4;
      drawCar(ctx, width / 2, userCarY, userCarScale, '#1d4ed8', true);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [speed, distance, roadType, isPaused]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden border-b border-gray-800 shadow-[inset_0_0_200px_rgba(0,0,0,1)]">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* HUD Layer */}
      <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-5">
            <div className="bg-black/90 border-l-4 border-blue-500 text-blue-300 text-[13px] font-mono px-6 py-3 rounded-r backdrop-blur-2xl shadow-2xl border border-gray-800">
              <span className="opacity-50 mr-2">SYS_INIT:</span> ACTIVE_TELEMETRY
            </div>
            <div className="bg-black/90 border-l-4 border-yellow-500 text-yellow-300 text-[13px] font-mono px-6 py-3 rounded-r backdrop-blur-2xl shadow-2xl border border-gray-800">
              <span className="opacity-50 mr-2">ENVIRONMENT:</span> {roadType.toUpperCase()}
            </div>
          </div>
          
          <div className="text-right">
             <div className="text-white font-black text-7xl italic tracking-tighter drop-shadow-[0_12px_12px_rgba(0,0,0,1)] flex items-baseline justify-end gap-3">
               {speed.toFixed(0)} <span className="text-3xl text-gray-400 font-normal">KM/H</span>
             </div>
             <div className="text-blue-500 font-mono text-[12px] tracking-[0.4em] mt-3 font-bold uppercase">Sensor Flux: 100%</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          {isPaused && (
            <div className="bg-yellow-500 text-black font-black px-16 py-5 rounded-full text-2xl tracking-[0.5em] animate-pulse border-4 border-white shadow-[0_0_80px_rgba(234,179,8,0.6)]">
              SIMULATION FROZEN
            </div>
          )}
          <div className="bg-black/80 text-gray-500 text-[11px] uppercase tracking-[0.4em] mb-6 px-8 py-3 rounded-full border border-gray-800 backdrop-blur-lg shadow-lg">
            Academic Demonstration | AI-ACC Research Module v3.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadSimulation;
