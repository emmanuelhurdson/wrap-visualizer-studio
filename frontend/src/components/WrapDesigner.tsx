import React, { useRef, useEffect, useState } from "react";
import { CanvasTexture } from "three";

interface WrapDesignerProps {
  onTextureUpdate: (texture: CanvasTexture) => void;
  existingTexture?: CanvasTexture | null;
  width?: number;
  height?: number;
}

export const WrapDesigner: React.FC<WrapDesignerProps> = ({
  onTextureUpdate,
  existingTexture,
  width = 512,
  height = 512,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#ff0000");
  const [brushSize, setBrushSize] = useState(10);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    const cells = 16;
    const cellW = width / cells;
    const cellH = height / cells;
    for (let i = 0; i <= cells; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellW, 0);
      ctx.lineTo(i * cellW, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellH);
      ctx.lineTo(width, i * cellH);
      ctx.stroke();
    }
    ctx.restore();
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    if (existingTexture && existingTexture.image) {
      // Copy existing texture to canvas
      ctx.drawImage(existingTexture.image, 0, 0, width, height);
    } else {
      // Start with white background and grid
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      drawGrid(ctx);
    }
    const texture = new CanvasTexture(canvas);
    onTextureUpdate(texture);
  };

  useEffect(() => {
    initCanvas();
  }, [existingTexture, width, height]);

  const drawLine = (x0: number, y0: number, x1: number, y1: number, ctx: CanvasRenderingContext2D) => {
    const distance = Math.hypot(x1 - x0, y1 - y0);
    if (distance < 0.1) return;
    const steps = Math.max(2, Math.ceil(distance / (brushSize / 2)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = x0 + (x1 - x0) * t;
      const cy = y0 + (y1 - y0) * t;
      ctx.beginPath();
      ctx.arc(cx, cy, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const draw = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = brushColor;
    if (lastPosRef.current) {
      drawLine(lastPosRef.current.x, lastPosRef.current.y, x, y, ctx);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPosRef.current = { x, y };
  };

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    lastPosRef.current = null;
    const { x, y } = getCanvasCoords(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) draw(x, y, ctx);
    updateTexture();
  };

  const drawMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) draw(x, y, ctx);
    updateTexture();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let x = (e.clientX - rect.left) * scaleX;
    let y = (e.clientY - rect.top) * scaleY;
    x = Math.min(Math.max(0, x), canvas.width);
    y = Math.min(Math.max(0, y), canvas.height);
    return { x, y };
  };

  const updateTexture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const texture = new CanvasTexture(canvas);
    onTextureUpdate(texture);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    drawGrid(ctx);
    updateTexture();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center flex-wrap">
        <label className="text-sm font-medium">Colour:</label>
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
        onMouseDown={startDrawing}
        onMouseMove={drawMove}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        className="border border-gray-300 rounded cursor-crosshair"
        style={{ width: "100%", maxWidth: "400px", height: "auto" }}
      />
      <p className="text-xs text-muted-foreground">
        Paint on this canvas. Your design will appear only on the selected car part.
      </p>
    </div>
  );
};
