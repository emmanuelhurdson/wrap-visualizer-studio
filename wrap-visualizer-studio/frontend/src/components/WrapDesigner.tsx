// src/components/WrapDesigner.tsx
import React, { useRef, useEffect, useState } from 'react';
import { CanvasTexture } from 'three';

interface WrapDesignerProps {
  onTextureUpdate: (texture: CanvasTexture) => void;
  width?: number;
  height?: number;
}

export const WrapDesigner: React.FC<WrapDesignerProps> = ({
  onTextureUpdate,
  width = 512,
  height = 512,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(10);

  // Initialize canvas and create texture
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with white (or transparent) background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Optional: draw a light grid or outline of car UVs (you can add later)

    const texture = new CanvasTexture(canvas);
    onTextureUpdate(texture);
  }, [width, height]);

  // Drawing logic
  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = brushColor;
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Update Three.js texture
    const texture = new CanvasTexture(canvas);
    onTextureUpdate(texture);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    draw(offsetX, offsetY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    draw(offsetX, offsetY);
  };

  const handleMouseUp = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    const texture = new CanvasTexture(canvas);
    onTextureUpdate(texture);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center">
        <label className="text-sm font-medium">Color:</label>
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          className="w-8 h-8 rounded border"
        />
        <label className="text-sm font-medium ml-2">Brush size:</label>
        <input
          type="range"
          min="2"
          max="40"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-32"
        />
        <button
          onClick={clearCanvas}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border border-gray-300 rounded cursor-crosshair"
        style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
      />
      <p className="text-xs text-muted-foreground">
        Draw directly on this canvas – your design will appear on the 3D car.
      </p>
    </div>
  );
};
