
import React, { useEffect, useRef } from 'react';
import { TelemetryPoint } from '../types';

interface TelemetryGraphsProps {
  history: TelemetryPoint[];
}

const TelemetryGraphs: React.FC<TelemetryGraphsProps> = ({ history }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    const padding = 20;
    const graphHeight = (height - padding * 4) / 3;

    ctx.clearRect(0, 0, width, height);
    
    const drawGraph = (
      data: number[], 
      yOffset: number, 
      label: string, 
      color: string, 
      maxVal: number
    ) => {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, yOffset, width - padding * 2, graphHeight);
      
      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.fillText(label, padding, yOffset - 5);

      if (data.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      const step = (width - padding * 2) / (data.length - 1);
      data.forEach((val, i) => {
        const x = padding + i * step;
        const normalizedVal = Math.min(1, val / maxVal);
        const y = yOffset + graphHeight - (normalizedVal * graphHeight);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    const limit = 50; // Points to show
    const recent = history.slice(-limit);

    drawGraph(recent.map(p => p.speed), padding + 10, 'SPEED (KM/H)', '#3b82f6', 120);
    drawGraph(recent.map(p => p.distance), padding * 2 + graphHeight + 10, 'DISTANCE (M)', '#eab308', 200);
    drawGraph(recent.map(p => p.acceleration), padding * 3 + graphHeight * 2 + 10, 'ACCEL/BRAKE FORCE', '#ef4444', 5);

  }, [history]);

  return (
    <div className="flex-1 min-h-[200px] border border-gray-800 bg-gray-950/50 rounded-lg p-2">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default TelemetryGraphs;
