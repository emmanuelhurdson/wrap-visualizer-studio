import { useEffect, useRef } from "react";
import type { Sprite360Result } from "@/components/ThreeScene";

type Sprite360ViewerProps = {
  sprite:     Sprite360Result;
  size?:      number;   // displayed square size in px (default 460)
  autoSpin?:  boolean;  // gentle auto-rotate until the user drags (default true)
  className?: string;
};

// Slices a captureSprite360() sprite sheet back into frames and lets the user
// drag horizontally to spin the car a full 360°. Drag a full width ≈ one rotation.
const Sprite360Viewer = ({
  sprite,
  size = 460,
  autoSpin = true,
  className,
}: Sprite360ViewerProps) => {
  const { dataUrl, frames, cols, tile } = sprite;

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imgRef       = useRef<HTMLImageElement | null>(null);
  const frameRef     = useRef(0);          // fractional current frame
  const draggingRef  = useRef(false);
  const lastXRef     = useRef(0);
  const interactedRef = useRef(false);

  // Draw the current frame's tile, scaled to fill the display canvas.
  const draw = () => {
    const cv = canvasRef.current, img = imgRef.current;
    if (!cv || !img) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const f  = ((Math.round(frameRef.current) % frames) + frames) % frames;
    const sx = (f % cols) * tile;
    const sy = Math.floor(f / cols) * tile;

    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, sx, sy, tile, tile, 0, 0, cv.width, cv.height);
  };

  // Load the sprite sheet once per source.
  useEffect(() => {
    const img = new Image();
    img.onload = () => { imgRef.current = img; draw(); };
    img.src = dataUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUrl]);

  // Auto-spin until first interaction.
  useEffect(() => {
    if (!autoSpin) return;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (interactedRef.current || draggingRef.current) return;
      const dt = (now - prev) / 1000;
      prev = now;
      frameRef.current += dt * frames * 0.15; // ~0.15 rotations / second
      draw();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpin, frames]);

  // ── Drag-to-spin ────────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current   = true;
    interactedRef.current = true;
    lastXRef.current      = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    // Full display width drag = one complete rotation.
    frameRef.current += (dx / size) * frames;
    draw();
  };

  const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      className={className}
      style={{
        width: "100%",
        maxWidth: size,
        aspectRatio: "1 / 1",
        height: "auto",
        touchAction: "none",
        cursor: "ew-resize",
        borderRadius: "0.75rem",
        background: "#1a1a1a",
      }}
    />
  );
};

export default Sprite360Viewer;
